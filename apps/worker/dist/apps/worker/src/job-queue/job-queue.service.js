"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JobQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueueService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const drizzle_1 = require("../../../../libs/drizzle/index.ts");
const repository_1 = require("@platform/drizzle/repository");
const drizzle_orm_1 = require("drizzle-orm");
const domain_1 = require("../../../../libs/domain/src/index.ts");
let JobQueueService = JobQueueService_1 = class JobQueueService extends repository_1.BaseRepository {
    portfolioService;
    recordsService;
    workflowService;
    eligibilityService;
    logger = new common_1.Logger(JobQueueService_1.name);
    constructor(portfolioService, recordsService, workflowService, eligibilityService) {
        super(drizzle_1.jobQueue, drizzle_1.db);
        this.portfolioService = portfolioService;
        this.recordsService = recordsService;
        this.workflowService = workflowService;
        this.eligibilityService = eligibilityService;
    }
    async processPendingJobs() {
        await this._db.transaction(async (tx) => {
            const lockedJobsRes = await tx.execute((0, drizzle_orm_1.sql) `
            SELECT id, job_type, payload FROM job_queue
            WHERE status = 'pending' AND scheduled_for <= NOW()
            ORDER BY priority ASC, created_at ASC
            LIMIT 5
            FOR UPDATE SKIP LOCKED;
        `);
            const rows = lockedJobsRes.rows;
            if (rows.length === 0)
                return;
            for (const row of rows) {
                const jobId = String(row.id);
                await tx.update(drizzle_1.jobQueue).set({ status: 'running', updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(drizzle_1.jobQueue.id, jobId));
                try {
                    if (row.job_type === 'portfolio.ingest') {
                        await this.handlePortfolioIngest(row.payload.portfolioId, row.payload.tenantId);
                    }
                    await tx.update(drizzle_1.jobQueue).set({ status: 'completed', updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(drizzle_1.jobQueue.id, jobId));
                }
                catch (err) {
                    this.logger.error(`Job ${jobId} failed: ${err.message}`);
                    await tx.update(drizzle_1.jobQueue).set({ status: 'failed', updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(drizzle_1.jobQueue.id, jobId));
                }
            }
        });
    }
    async handlePortfolioIngest(portfolioId, tenantId) {
        this.logger.log(`Processing ingestion for portfolio: ${portfolioId}`);
        const records = await drizzle_1.db.select().from(drizzle_orm_1.sql.raw('portfolio_records')).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_orm_1.sql.raw('portfolio_id'), portfolioId), (0, drizzle_orm_1.eq)(drizzle_orm_1.sql.raw('tenant_id'), tenantId)));
        for (const record of records) {
            if (!record.dpdBucket)
                continue;
            const rules = await this.workflowService.fetchActiveRulesForBucket(record.dpdBucket);
            for (const rule of rules) {
                const isEligible = await this.eligibilityService.evaluateRecordEligibility(record.id, 'sms');
                if (isEligible.eligible) {
                    const scheduledAt = new Date();
                    scheduledAt.setDate(scheduledAt.getDate() + (rule.delayDays || 0));
                    await this._db.insert(drizzle_1.commEvents).values({
                        tenantId,
                        recordId: record.id,
                        ruleId: rule.id,
                        templateId: rule.templateId,
                        channel: 'sms',
                        status: 'scheduled',
                        scheduledAt,
                        idempotencyKey: `ingest_${record.id}_${rule.id}`,
                    });
                }
            }
        }
    }
};
exports.JobQueueService = JobQueueService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobQueueService.prototype, "processPendingJobs", null);
exports.JobQueueService = JobQueueService = JobQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_1.PortfoliosService,
        domain_1.PortfolioRecordsService,
        domain_1.WorkflowRulesService,
        domain_1.EligibilityService])
], JobQueueService);
//# sourceMappingURL=job-queue.service.js.map