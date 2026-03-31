import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db, jobQueue, commEvents } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { eq, inArray, sql, and } from 'drizzle-orm';
import { 
  PortfoliosService, 
  PortfolioRecordsService, 
  WorkflowRulesService,
  EligibilityService 
} from '@platform/domain';

@Injectable()
export class JobQueueService extends BaseRepository<typeof jobQueue> {
  private readonly logger = new Logger(JobQueueService.name);

  constructor(
    private readonly portfolioService: PortfoliosService,
    private readonly recordsService: PortfolioRecordsService,
    private readonly workflowService: WorkflowRulesService,
    private readonly eligibilityService: EligibilityService,
  ) {
    super(jobQueue, db);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPendingJobs() {
    await this._db.transaction(async (tx) => {
        const lockedJobsRes = await tx.execute<{ id: string, job_type: string, payload: any }>(sql`
            SELECT id, job_type, payload FROM job_queue
            WHERE status = 'pending' AND scheduled_for <= NOW()
            ORDER BY priority ASC, created_at ASC
            LIMIT 5
            FOR UPDATE SKIP LOCKED;
        `);
        
        const rows = lockedJobsRes.rows;
        if (rows.length === 0) return;

        for (const row of rows) {
            const jobId = String(row.id);
            await tx.update(jobQueue).set({ status: 'running', updatedAt: new Date() }).where(eq(jobQueue.id, jobId));
            
            try {
                if (row.job_type === 'portfolio.ingest') {
                    await this.handlePortfolioIngest(row.payload.portfolioId, row.payload.tenantId);
                }
                
                await tx.update(jobQueue).set({ status: 'completed', updatedAt: new Date() }).where(eq(jobQueue.id, jobId));
            } catch (err) {
                this.logger.error(`Job ${jobId} failed: ${err.message}`);
                await tx.update(jobQueue).set({ status: 'failed', updatedAt: new Date() }).where(eq(jobQueue.id, jobId));
            }
        }
    });
  }

  /**
   * For each record in the portfolio, find matching workflow rules and generate CommEvents
   */
  async handlePortfolioIngest(portfolioId: string, tenantId: string) {
    this.logger.log(`Processing ingestion for portfolio: ${portfolioId}`);

    // 1. Fetch all records for this portfolio
    const records = await this.recordsService._db.select().from(sql.raw('portfolio_records')).where(and(
        eq(sql.raw('portfolio_id'), portfolioId),
        eq(sql.raw('tenant_id'), tenantId)
    ));

    for (const record of records as any) {
        if (!record.dpdBucket) continue;

        // 2. Fetch active workflow rules for this bucket
        const rules = await this.workflowService.fetchActiveRulesForBucket(record.dpdBucket);

        for (const rule of rules) {
            // 3. Check Eligibility (Opt-out, Caps, etc.)
            const isEligible = await this.eligibilityService.evaluateRecordEligibility(record.id, 'sms'); // Default to SMS for now
            
            if (isEligible.eligible) {
                // 4. Generate CommEvent
                const scheduledAt = new Date();
                scheduledAt.setDate(scheduledAt.getDate() + (rule.delayDays || 0));

                await this._db.insert(commEvents).values({
                    tenantId,
                    recordId: record.id,
                    ruleId: rule.id,
                    templateId: rule.templateId,
                    channel: 'sms',
                    status: 'scheduled',
                    scheduledAt, // Fixed column name from schema
                    idempotencyKey: `ingest_${record.id}_${rule.id}`, // Unique key for safety
                });
            }
        }
    }
  }
}
