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
    this.logger.log(`Processing comm.dispatch for tenant: ${tenantId}`);

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

    if (dueEvents.length === 0) {
      this.logger.log(`No due events for tenant ${tenantId}`);
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const event of dueEvents) {
      try {
        // 2. Mark as queued (in-flight)
        await db.update(commEvents).set({ status: 'queued' }).where(eq(commEvents.id, event.id));

        // 3. Fetch the portfolio record to get mobile + dynamic fields
        const [record] = await db
          .select()
          .from(portfolioRecords)
          .where(eq(portfolioRecords.id, event.recordId))
          .limit(1);

        if (!record) {
          this.logger.warn(`Record not found: ${event.recordId}, skipping event ${event.id}`);
          await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
          failed++;
          continue;
        }

        // 3b. Fetch the journeyStep to get the templateId
        let templateId: string | null = null;
        if (event.journeyStepId) {
          const [step] = await db
            .select({ templateId: journeySteps.templateId })
            .from(journeySteps)
            .where(eq(journeySteps.id, event.journeyStepId))
            .limit(1);
          if (step) templateId = step.templateId;
        }

        // 4. Fetch template body
        let body = '';
        if (templateId) {
          const [template] = await db
            .select()
            .from(commTemplates)
            .where(eq(commTemplates.id, templateId))
            .limit(1);

          if (template) {
            const allFields: Record<string, any> = {
              name: record.name,
              mobile: record.mobile,
              userId: record.userId,
              product: record.product,
              currentDpd: record.currentDpd,
              segmentId: record.segmentId,
              overdue: record.outstanding,
              outstanding: record.outstanding,
              ...(record.dynamicFields as Record<string, any> || {}),
            };

            body = this.templateRenderer.renderBody(template.body, allFields);
          }
        }

        if (!body) {
          this.logger.warn(`Empty body for event ${event.id}, skipping`);
          await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
          failed++;
          continue;
        }

        // 5. Fetch channel config for provider settings
        const [channelConfig] = await db
          .select()
          .from(channelConfigs)
          .where(and(eq(channelConfigs.tenantId, tenantId), eq(channelConfigs.channel, event.channel), eq(channelConfigs.isEnabled, true)))
          .limit(1);

        // 6. TODO: Dispatch via provider adapter (placeholder for now)
        // In production, this would call SMS/WhatsApp/IVR providers
        this.logger.log(`[DISPATCH] Channel: ${event.channel}, To: ${record.mobile}, Body: ${body.substring(0, 60)}...`);

        // 7. Mark as sent + write delivery log
        await db.update(commEvents).set({
          status: 'sent',
          sentAt: new Date(),
          resolvedBody: body,
        }).where(eq(commEvents.id, event.id));

        await db.insert(deliveryLogs).values({
          eventId: event.id,
          tenantId,
          providerName: channelConfig?.providerName || event.channel,
          providerMsgId: `sim_${Date.now()}`,
          deliveryStatus: 'sent',
        });

        sent++;
      } catch (err: any) {
        this.logger.error(`Event ${event.id} dispatch error: ${err.message}`);
        await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
        failed++;
      }
    }

    this.logger.log(`comm.dispatch complete for tenant ${tenantId}: ${sent} sent, ${failed} failed out of ${dueEvents.length} events`);
  }
}
