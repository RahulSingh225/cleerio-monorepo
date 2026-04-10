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
const drizzle_1 = require("../../../../libs/drizzle");
const repository_1 = require("../../../../libs/drizzle/repository");
const drizzle_orm_1 = require("drizzle-orm");
const domain_1 = require("../../../../libs/domain/src");
let JobQueueService = JobQueueService_1 = class JobQueueService extends repository_1.BaseRepository {
    portfolioService;
    recordsService;
    segmentationRunsService;
    templateRenderer;
    deliveryLogsService;
    logger = new common_1.Logger(JobQueueService_1.name);
    constructor(portfolioService, recordsService, segmentationRunsService, templateRenderer, deliveryLogsService) {
        super(drizzle_1.taskQueue, drizzle_1.db);
        this.portfolioService = portfolioService;
        this.recordsService = recordsService;
        this.segmentationRunsService = segmentationRunsService;
        this.templateRenderer = templateRenderer;
        this.deliveryLogsService = deliveryLogsService;
    }
    async processPendingJobs() {
        let claimedJobs = [];
        await this._db.transaction(async (tx) => {
            const lockedJobsRes = await tx.execute((0, drizzle_orm_1.sql) `
        SELECT id, job_type, payload FROM task_queue
        WHERE status = 'pending' AND run_after <= NOW()
        ORDER BY priority ASC, created_at ASC
        LIMIT 5
        FOR UPDATE SKIP LOCKED;
      `);
            const rows = lockedJobsRes.rows;
            if (rows.length === 0)
                return;
            const ids = rows.map((r) => String(r.id));
            for (const id of ids) {
                await tx.update(drizzle_1.taskQueue).set({ status: 'processing', updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(drizzle_1.taskQueue.id, id));
            }
            claimedJobs = rows.map((r) => ({ id: String(r.id), job_type: r.job_type, payload: r.payload }));
        });
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
                await this._db.update(drizzle_1.taskQueue).set({ status: 'completed', completedAt: new Date(), updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(drizzle_1.taskQueue.id, job.id));
            }
            catch (err) {
                this.logger.error(`Job ${job.id} failed: ${err.message}`);
                await this._db.update(drizzle_1.taskQueue).set({
                    status: 'failed',
                    lastError: err.message,
                    failedAt: new Date(),
                    updatedAt: new Date(),
                }).where((0, drizzle_orm_1.eq)(drizzle_1.taskQueue.id, job.id));
            }
        }
    }
    async scheduleCommDispatch() {
        const dueEvents = await drizzle_1.db
            .select({ tenantId: drizzle_1.commEvents.tenantId })
            .from(drizzle_1.commEvents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.commEvents.status, 'scheduled'), (0, drizzle_orm_1.lte)(drizzle_1.commEvents.scheduledAt, new Date())))
            .groupBy(drizzle_1.commEvents.tenantId)
            .limit(10);
        for (const { tenantId } of dueEvents) {
            if (!tenantId)
                continue;
            const existing = await drizzle_1.db
                .select({ id: drizzle_1.taskQueue.id })
                .from(drizzle_1.taskQueue)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.taskQueue.tenantId, tenantId), (0, drizzle_orm_1.eq)(drizzle_1.taskQueue.jobType, 'comm.dispatch'), (0, drizzle_orm_1.eq)(drizzle_1.taskQueue.status, 'pending')))
                .limit(1);
            if (existing.length > 0)
                continue;
            await this._db.insert(drizzle_1.taskQueue).values({
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
    async handlePortfolioIngest(portfolioId, tenantId) {
        this.logger.log(`Processing ingestion for portfolio: ${portfolioId}`);
        await this._db.insert(drizzle_1.taskQueue).values({
            tenantId,
            jobType: 'segmentation.run',
            status: 'pending',
            payload: { tenantId, triggeredBy: 'portfolio.ingest', portfolioId },
            priority: 2,
            runAfter: new Date(),
        });
        this.logger.log(`Queued segmentation.run after ingestion for portfolio: ${portfolioId}`);
    }
    async handleSegmentationRun(tenantId) {
        this.logger.log(`Processing segmentation run for tenant: ${tenantId}`);
        await this.segmentationRunsService.processRun(tenantId);
        this.logger.log(`Completed segmentation run for tenant: ${tenantId}`);
    }
    async handleCommDispatch(tenantId, jobId) {
        this.logger.log(`Processing comm.dispatch for tenant: ${tenantId}`);
        const dueEvents = await drizzle_1.db
            .select()
            .from(drizzle_1.commEvents)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.commEvents.tenantId, tenantId), (0, drizzle_orm_1.eq)(drizzle_1.commEvents.status, 'scheduled'), (0, drizzle_orm_1.lte)(drizzle_1.commEvents.scheduledAt, new Date())))
            .limit(50);
        if (dueEvents.length === 0) {
            this.logger.log(`No due events for tenant ${tenantId}`);
            return;
        }
        let sent = 0;
        let failed = 0;
        for (const event of dueEvents) {
            try {
                await drizzle_1.db.update(drizzle_1.commEvents).set({ status: 'queued' }).where((0, drizzle_orm_1.eq)(drizzle_1.commEvents.id, event.id));
                const [record] = await drizzle_1.db
                    .select()
                    .from(drizzle_1.portfolioRecords)
                    .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.id, event.recordId))
                    .limit(1);
                if (!record) {
                    this.logger.warn(`Record not found: ${event.recordId}, skipping event ${event.id}`);
                    await drizzle_1.db.update(drizzle_1.commEvents).set({ status: 'failed' }).where((0, drizzle_orm_1.eq)(drizzle_1.commEvents.id, event.id));
                    failed++;
                    continue;
                }
                let templateId = null;
                if (event.journeyStepId) {
                    const [step] = await drizzle_1.db
                        .select({ templateId: drizzle_1.journeySteps.templateId })
                        .from(drizzle_1.journeySteps)
                        .where((0, drizzle_orm_1.eq)(drizzle_1.journeySteps.id, event.journeyStepId))
                        .limit(1);
                    if (step)
                        templateId = step.templateId;
                }
                let body = '';
                if (templateId) {
                    const [template] = await drizzle_1.db
                        .select()
                        .from(drizzle_1.commTemplates)
                        .where((0, drizzle_orm_1.eq)(drizzle_1.commTemplates.id, templateId))
                        .limit(1);
                    if (template) {
                        const allFields = {
                            name: record.name,
                            mobile: record.mobile,
                            userId: record.userId,
                            product: record.product,
                            currentDpd: record.currentDpd,
                            dpdBucket: record.dpdBucket,
                            overdue: record.outstanding,
                            outstanding: record.outstanding,
                            ...(record.dynamicFields || {}),
                        };
                        body = this.templateRenderer.renderBody(template.body, allFields);
                    }
                }
                if (!body) {
                    this.logger.warn(`Empty body for event ${event.id}, skipping`);
                    await drizzle_1.db.update(drizzle_1.commEvents).set({ status: 'failed' }).where((0, drizzle_orm_1.eq)(drizzle_1.commEvents.id, event.id));
                    failed++;
                    continue;
                }
                const [channelConfig] = await drizzle_1.db
                    .select()
                    .from(drizzle_1.channelConfigs)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.channelConfigs.tenantId, tenantId), (0, drizzle_orm_1.eq)(drizzle_1.channelConfigs.channel, event.channel), (0, drizzle_orm_1.eq)(drizzle_1.channelConfigs.isEnabled, true)))
                    .limit(1);
                this.logger.log(`[DISPATCH] Channel: ${event.channel}, To: ${record.mobile}, Body: ${body.substring(0, 60)}...`);
                await drizzle_1.db.update(drizzle_1.commEvents).set({
                    status: 'sent',
                    sentAt: new Date(),
                    resolvedBody: body,
                }).where((0, drizzle_orm_1.eq)(drizzle_1.commEvents.id, event.id));
                await drizzle_1.db.insert(drizzle_1.deliveryLogs).values({
                    eventId: event.id,
                    tenantId,
                    providerName: channelConfig?.providerName || event.channel,
                    providerMsgId: `sim_${Date.now()}`,
                    deliveryStatus: 'sent',
                });
                sent++;
            }
            catch (err) {
                this.logger.error(`Event ${event.id} dispatch error: ${err.message}`);
                await drizzle_1.db.update(drizzle_1.commEvents).set({ status: 'failed' }).where((0, drizzle_orm_1.eq)(drizzle_1.commEvents.id, event.id));
                failed++;
            }
        }
        this.logger.log(`comm.dispatch complete for tenant ${tenantId}: ${sent} sent, ${failed} failed out of ${dueEvents.length} events`);
    }
};
exports.JobQueueService = JobQueueService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobQueueService.prototype, "processPendingJobs", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobQueueService.prototype, "scheduleCommDispatch", null);
exports.JobQueueService = JobQueueService = JobQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_1.PortfoliosService,
        domain_1.PortfolioRecordsService,
        domain_1.SegmentationRunsService,
        domain_1.TemplateRendererService,
        domain_1.DeliveryLogsService])
], JobQueueService);
//# sourceMappingURL=job-queue.service.js.map