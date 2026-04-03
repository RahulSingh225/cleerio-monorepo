import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db, jobQueue, commEvents, portfolioRecords, commTemplates, channelConfigs, deliveryLogs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { eq, and, sql, lte } from 'drizzle-orm';
import { 
  PortfoliosService, 
  PortfolioRecordsService, 
  WorkflowRulesService,
  EligibilityService,
  CommunicationService,
  TemplateRendererService,
  ChannelConfigsService,
  DeliveryLogsService,
} from '@platform/domain';

@Injectable()
export class JobQueueService extends BaseRepository<typeof jobQueue> {
  private readonly logger = new Logger(JobQueueService.name);

  constructor(
    private readonly portfolioService: PortfoliosService,
    private readonly recordsService: PortfolioRecordsService,
    private readonly workflowService: WorkflowRulesService,
    private readonly eligibilityService: EligibilityService,
    private readonly communicationService: CommunicationService,
    private readonly templateRenderer: TemplateRendererService,
    private readonly channelConfigsService: ChannelConfigsService,
    private readonly deliveryLogsService: DeliveryLogsService,
  ) {
    super(jobQueue, db);
  }

  // ─── MAIN JOB POLLER ──────────────────────────────────────────

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPendingJobs() {
    // Phase 1: Claim jobs with narrow transaction scope
    let claimedJobs: { id: string; job_type: string; payload: any }[] = [];

    await this._db.transaction(async (tx) => {
      const lockedJobsRes = await tx.execute<{ id: string; job_type: string; payload: any }>(sql`
        SELECT id, job_type, payload FROM job_queue
        WHERE status = 'pending' AND run_after <= NOW()
        ORDER BY priority ASC, created_at ASC
        LIMIT 5
        FOR UPDATE SKIP LOCKED;
      `);

      const rows = lockedJobsRes.rows;
      if (rows.length === 0) return;

      const ids = rows.map((r) => String(r.id));
      for (const id of ids) {
        await tx.update(jobQueue).set({ status: 'processing', updatedAt: new Date() }).where(eq(jobQueue.id, id));
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
          case 'comm.dispatch':
            await this.handleCommDispatch(job.payload.tenantId, job.id);
            break;
          default:
            this.logger.warn(`Unknown job type: ${job.job_type}`);
        }

        await this._db.update(jobQueue).set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() }).where(eq(jobQueue.id, job.id));
      } catch (err: any) {
        this.logger.error(`Job ${job.id} failed: ${err.message}`);
        await this._db.update(jobQueue).set({
          status: 'failed',
          lastError: err.message,
          failedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(jobQueue.id, job.id));
      }
    }
  }

  // ─── COMM.DISPATCH SCHEDULER ────────────────────────────────────
  // Runs every 30 seconds — finds due scheduled events and creates dispatch jobs

  @Cron(CronExpression.EVERY_30_SECONDS)
  async scheduleCommDispatch() {
    // Find all scheduled events that are due (scheduledAt <= NOW)
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
        .select({ id: jobQueue.id })
        .from(jobQueue)
        .where(and(
          eq(jobQueue.tenantId, tenantId),
          eq(jobQueue.jobType, 'comm.dispatch'),
          eq(jobQueue.status, 'pending'),
        ))
        .limit(1);

      if (existing.length > 0) continue; // Already queued

      await this._db.insert(jobQueue).values({
        tenantId,
        jobType: 'comm.dispatch',
        status: 'pending',
        payload: { tenantId },
        priority: 3, // Higher priority than ingestion
        runAfter: new Date(),
      });

      this.logger.log(`Queued comm.dispatch job for tenant: ${tenantId}`);
    }
  }

  // ─── PORTFOLIO.INGEST HANDLER ────────────────────────────────

  async handlePortfolioIngest(portfolioId: string, tenantId: string) {
    this.logger.log(`Processing ingestion for portfolio: ${portfolioId}`);

    const records = await db
      .select()
      .from(portfolioRecords)
      .where(and(eq(portfolioRecords.portfolioId, portfolioId), eq(portfolioRecords.tenantId, tenantId)));

    for (const record of records) {
      if (!record.dpdBucket) continue;

      const rules = await this.workflowService.fetchActiveRulesForBucketName(tenantId, record.dpdBucket);

      for (const rule of rules) {
        const isEligible = await this.eligibilityService.evaluateRecordEligibility(record.id, rule.channel);

        if (isEligible.eligible) {
          const scheduledAt = new Date();
          scheduledAt.setDate(scheduledAt.getDate() + (rule.delayDays || 0));
          const dateStr = scheduledAt.toISOString().split('T')[0];

          await this._db.insert(commEvents).values({
            tenantId,
            recordId: record.id,
            ruleId: rule.id,
            templateId: rule.templateId,
            channel: rule.channel,
            status: 'scheduled',
            scheduledAt,
            idempotencyKey: `${record.id}:${rule.channel}:${dateStr}`,
          }).onConflictDoNothing();
        }
      }
    }

    this.logger.log(`Completed ingestion for portfolio: ${portfolioId}, processed ${records.length} records`);
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
        await db.update(commEvents).set({ status: 'queued', queuedAt: new Date(), jobId }).where(eq(commEvents.id, event.id));

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

        // 4. Fetch template body
        let body = '';
        if (event.templateId) {
          const [template] = await db
            .select()
            .from(commTemplates)
            .where(eq(commTemplates.id, event.templateId))
            .limit(1);

          if (template) {
            // Merge core fields + dynamic fields for variable substitution
            const allFields: Record<string, any> = {
              name: record.name,
              mobile: record.mobile,
              userId: record.userId,
              product: record.product,
              currentDpd: record.currentDpd,
              dpdBucket: record.dpdBucket,
              overdue: record.overdue,
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
        const channelConfig = await this.channelConfigsService.getActiveChannel(event.channel);
        const providerConfig = (channelConfig?.providerConfig as Record<string, any>) || {};

        // 6. Dispatch via provider adapter
        const result = await this.communicationService.dispatchMessage(
          event.channel,
          record.mobile,
          body,
          providerConfig,
        );

        // 7. Update event status + write delivery log
        if (result.success) {
          await db.update(commEvents).set({
            status: 'sent',
            sentAt: new Date(),
            resolvedBody: body,
          }).where(eq(commEvents.id, event.id));

          await db.insert(deliveryLogs).values({
            eventId: event.id,
            tenantId,
            providerName: channelConfig?.providerName || event.channel,
            providerMsgId: result.messageId,
            deliveryStatus: 'sent',
          });

          sent++;
        } else {
          await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));

          await db.insert(deliveryLogs).values({
            eventId: event.id,
            tenantId,
            providerName: channelConfig?.providerName || event.channel,
            providerMsgId: result.messageId,
            deliveryStatus: 'failed',
            errorCode: result.errorCode,
            errorMessage: result.errorMessage,
            callbackPayload: result.rawResponse,
          });

          failed++;
        }
      } catch (err: any) {
        this.logger.error(`Event ${event.id} dispatch error: ${err.message}`);
        await db.update(commEvents).set({ status: 'failed' }).where(eq(commEvents.id, event.id));
        failed++;
      }
    }

    this.logger.log(`comm.dispatch complete for tenant ${tenantId}: ${sent} sent, ${failed} failed out of ${dueEvents.length} events`);
  }
}

