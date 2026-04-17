import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db, taskQueue, commEvents, portfolioRecords, commTemplates, channelConfigs, deliveryLogs, journeySteps } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { eq, and, sql, lte } from 'drizzle-orm';
import {
  PortfoliosService,
  PortfolioRecordsService,
  SegmentationRunsService,
  TemplateRendererService,
  DeliveryLogsService,
  GenericDispatcherService,
  JourneyProgressionService,
  FeedbackProcessorService,
} from '@platform/domain';

@Injectable()
export class JobQueueService extends BaseRepository<typeof taskQueue> {
  private readonly logger = new Logger(JobQueueService.name);

  constructor(
    private readonly portfolioService: PortfoliosService,
    private readonly recordsService: PortfolioRecordsService,
    private readonly segmentationRunsService: SegmentationRunsService,
    private readonly templateRenderer: TemplateRendererService,
    private readonly deliveryLogsService: DeliveryLogsService,
    private readonly dispatcher: GenericDispatcherService,
    private readonly progression: JourneyProgressionService,
    private readonly feedbackProcessor: FeedbackProcessorService,
  ) {
    super(taskQueue, db);
  }

  // ─── MAIN JOB POLLER ──────────────────────────────────────────

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPendingJobs() {
    // Phase 1: Claim jobs with narrow transaction scope
    let claimedJobs: { id: string; job_type: string; payload: any }[] = [];

    await this._db.transaction(async (tx) => {
      const lockedJobsRes = await tx.execute<{ id: string; job_type: string; payload: any }>(sql`
        SELECT id, task_type as job_type, payload FROM task_queue
        WHERE status = 'pending' AND run_after <= NOW()
        ORDER BY priority ASC, created_at ASC
        LIMIT 5
        FOR UPDATE SKIP LOCKED;
      `);

      const rows = lockedJobsRes.rows;
      if (rows.length === 0) return;

      const ids = rows.map((r) => String(r.id));
      for (const id of ids) {
        await tx.update(taskQueue).set({ status: 'processing', updatedAt: new Date() }).where(eq(taskQueue.id, id));
      }
      claimedJobs = rows.map((r) => ({ id: String(r.id), job_type: r.job_type, payload: r.payload }));
    });

    // Phase 2: Process each claimed job OUTSIDE the transaction
    for (const job of claimedJobs) {
      try {
        switch (job.job_type) {
          case 'portfolio.ingest':
            await this.handlePortfolioIngest(job.payload.portfolioId, job.payload.tenantId);
            break;
          case 'segmentation.run':
            await this.handleSegmentationRun(job.payload.tenantId);
            break;
          case 'comm.dispatch':
            await this.handleCommDispatch(job.payload.tenantId, job.id);
            break;
          case 'feedback.process':
            await this.handleFeedbackProcess(job.payload);
            break;
          default:
            this.logger.warn(`Unknown job type: ${job.job_type}`);
        }

        await this._db.update(taskQueue).set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() }).where(eq(taskQueue.id, job.id));
      } catch (err: any) {
        this.logger.error(`Job ${job.id} failed: ${err.message}`);
        await this._db.update(taskQueue).set({
          status: 'failed',
          lastError: err.message,
          failedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(taskQueue.id, job.id));
      }
    }
  }

  // ─── COMM.DISPATCH SCHEDULER ────────────────────────────────────
  // Runs every 30 seconds — finds due scheduled events and creates dispatch jobs

  @Cron(CronExpression.EVERY_30_SECONDS)
  async scheduleCommDispatch() {
    const dueEvents = await db
      .select({ tenantId: commEvents.tenantId })
      .from(commEvents)
      .where(and(eq(commEvents.status, 'scheduled'), lte(commEvents.scheduledAt, new Date())))
      .groupBy(commEvents.tenantId)
      .limit(10);

    for (const { tenantId } of dueEvents) {
      if (!tenantId) continue;

      // Check if there's already a pending comm.dispatch job for this tenant
      const existing = await db
        .select({ id: taskQueue.id })
        .from(taskQueue)
        .where(and(
          eq(taskQueue.tenantId, tenantId),
          eq(taskQueue.jobType, 'comm.dispatch'),
          eq(taskQueue.status, 'pending'),
        ))
        .limit(1);

      if (existing.length > 0) continue; // Already queued

      await this._db.insert(taskQueue).values({
        tenantId,
        jobType: 'comm.dispatch',
        status: 'pending',
        payload: { tenantId },
        priority: 3,
        runAfter: new Date(),
      });

      this.logger.log(`Queued comm.dispatch job for tenant: ${tenantId}`);
    }
  }

  // ─── PORTFOLIO.INGEST HANDLER ────────────────────────────────

  async handlePortfolioIngest(portfolioId: string, tenantId: string) {
    this.logger.log(`Processing ingestion for portfolio: ${portfolioId}`);

    // In v2, after portfolio ingestion, we trigger a segmentation run
    // to assign records to segments based on the new criteria engine
    await this._db.insert(taskQueue).values({
      tenantId,
      jobType: 'segmentation.run',
      status: 'pending',
      payload: { tenantId, triggeredBy: 'portfolio.ingest', portfolioId },
      priority: 2,
      runAfter: new Date(),
    });

    this.logger.log(`Queued segmentation.run after ingestion for portfolio: ${portfolioId}`);
  }

  // ─── SEGMENTATION.RUN HANDLER ────────────────────────────────

  async handleSegmentationRun(tenantId: string) {
    this.logger.log(`Processing segmentation run for tenant: ${tenantId}`);
    // Create a run record first, then process it
    const run = await this.segmentationRunsService.startRun(tenantId);
    await this.segmentationRunsService.processRun(run.id);
    this.logger.log(`Completed segmentation run ${run.id} for tenant: ${tenantId}`);
  }

  // ─── COMM.DISPATCH HANDLER ─────────────────────────────────────
  // Picks up scheduled commEvents that are due and dispatches them via providers

  async handleCommDispatch(tenantId: string, jobId: string) {
    this.logger.log(`Executing comm.dispatch logic for tenant: ${tenantId}`);

    // 1. Fetch all due scheduled events for this tenant (batch of 50)
    const dueEvents = await db
      .select()
      .from(commEvents)
      .where(and(
        eq(commEvents.tenantId, tenantId),
        eq(commEvents.status, 'scheduled'),
        lte(commEvents.scheduledAt, new Date()),
      ))
      .limit(50);

    if (dueEvents.length === 0) return;

    let sent = 0;
    let failed = 0;

    for (const event of dueEvents) {
      try {
        // Mark as queued (in-flight)
        await db.update(commEvents).set({ status: 'queued' }).where(eq(commEvents.id, event.id));

        // Fetch the record
        const [record] = await db.select().from(portfolioRecords).where(eq(portfolioRecords.id, event.recordId)).limit(1);
        if (!record) {
          await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
          failed++; continue;
        }

        // Fetch Step Details
        const [step] = await db.select().from(journeySteps).where(eq(journeySteps.id, event.journeyStepId!)).limit(1);
        if (!step) {
          this.logger.warn(`No journey step found for event ${event.id}`);
          await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
          failed++; continue;
        }

        // Logic for different step types
        if (step.actionType === 'wait') {
          // Wait period over, mark as sent (completion of the wait) and move to next
          await db.update(commEvents).set({ status: 'sent', sentAt: new Date() }).where(eq(commEvents.id, event.id));
          await this.progression.moveToNextStep(tenantId, record.id, step.id);
          sent++;
          continue;
        }

        if (['send_sms', 'send_whatsapp', 'send_ivr', 'send_voice_bot', 'send_message'].includes(step.actionType)) {
          // 1. Fetch Template
          const [template] = step.templateId 
            ? await db.select().from(commTemplates).where(eq(commTemplates.id, step.templateId)).limit(1)
            : [null];
          
          if (!template) {
            this.logger.warn(`No template found for step ${step.id}`);
            await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
            failed++; continue;
          }

          // 2. Fetch Channel Config
          const [channelConfig] = await db.select()
            .from(channelConfigs)
            .where(and(eq(channelConfigs.tenantId, tenantId), eq(channelConfigs.channel, step.channel!), eq(channelConfigs.isEnabled, true)))
            .limit(1);

          if (!channelConfig) {
            this.logger.warn(`No enabled channel config for ${step.channel} in tenant ${tenantId}`);
            await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
            failed++; continue;
          }

          // 3. Dispatch via Generic Dispatcher
          const result = await this.dispatcher.dispatch(tenantId, event, record, channelConfig, template);
          
          if (result.status === 'sent') {
            sent++;
            // 4. Move to next step in journey
            await this.progression.moveToNextStep(tenantId, record.id, step.id);
          } else {
            failed++;
          }
        } else {
          // Logic nodes (Manual Review / End)
          await db.update(commEvents).set({ status: 'sent', sentAt: new Date() }).where(eq(commEvents.id, event.id));
          sent++;
          if (step.actionType !== 'end_success' && step.actionType !== 'end_failure') {
             await this.progression.moveToNextStep(tenantId, record.id, step.id);
          }
        }
      } catch (err: any) {
        this.logger.error(`Event ${event.id} dispatch error: ${err.message}`);
        await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
        failed++;
      }
    }

    this.logger.log(`comm.dispatch complete for tenant ${tenantId}: ${sent} sent, ${failed} failed`);
  }

  // ─── FEEDBACK.PROCESS HANDLER ──────────────────────────────
  // Checks if feedback should trigger journey progression

  async handleFeedbackProcess(payload: any) {
    const { tenantId, recordId, eventId } = payload;
    this.logger.log(`Processing feedback job: record=${recordId}, event=${eventId}`);

    // Check if there's a 'wait' type step that's scheduled for this record
    // If feedback has arrived for a previous step, and the current step is a wait,
    // we can check if the wait should be resolved early
    const waitingEvents = await db
      .select()
      .from(commEvents)
      .innerJoin(journeySteps, eq(commEvents.journeyStepId, journeySteps.id))
      .where(and(
        eq(commEvents.recordId, recordId),
        eq(commEvents.status, 'scheduled'),
      ))
      .limit(5);

    for (const row of waitingEvents) {
      const step = row.journey_steps;
      const event = row.comm_events;

      // If this is a 'wait' step and it's due (or the wait condition is met by feedback)
      if (step.actionType === 'wait' && step.delayHours === 0) {
        // Zero-delay wait = wait_for_feedback — feedback has arrived, advance immediately
        await db.update(commEvents).set({ status: 'sent', sentAt: new Date() }).where(eq(commEvents.id, event.id));
        await this.progression.moveToNextStep(tenantId, recordId, step.id);
        this.logger.log(`Feedback resolved wait step ${step.id} for record ${recordId}`);
      }
    }
  }
}
