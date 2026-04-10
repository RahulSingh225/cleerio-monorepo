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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentationRunsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
const segments_service_1 = require("../segments/segments.service");
let SegmentationRunsService = class SegmentationRunsService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.segmentationRuns, drizzle_1.db);
    }
    async startRun(tenantId, portfolioId, triggeredBy) {
        const [totalResult] = await drizzle_1.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(drizzle_1.portfolioRecords)
            .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.tenantId, tenantId))
            .execute();
        const [run] = await drizzle_1.db
            .insert(drizzle_1.segmentationRuns)
            .values({
            tenantId,
            portfolioId: portfolioId || null,
            triggeredBy: triggeredBy || null,
            status: 'running',
            totalRecords: Number(totalResult?.value || 0),
            processed: 0,
        })
            .returning();
        return run;
    }
    async processRun(runId) {
        const [run] = await drizzle_1.db
            .select()
            .from(drizzle_1.segmentationRuns)
            .where((0, drizzle_orm_1.eq)(drizzle_1.segmentationRuns.id, runId))
            .execute();
        if (!run)
            throw new Error(`Segmentation run ${runId} not found`);
        const tenantId = run.tenantId;
        const activeSegments = await drizzle_1.db
            .select()
            .from(drizzle_1.segments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.segments.tenantId, tenantId), (0, drizzle_orm_1.eq)(drizzle_1.segments.isActive, true)))
            .orderBy(drizzle_1.segments.priority)
            .execute();
        const defaultSeg = activeSegments.find((s) => s.isDefault);
        const records = await drizzle_1.db
            .select()
            .from(drizzle_1.portfolioRecords)
            .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.tenantId, tenantId))
            .execute();
        let processed = 0;
        for (const record of records) {
            let matched = false;
            for (const seg of activeSegments) {
                if (seg.isDefault)
                    continue;
                const criteria = seg.criteriaJsonb;
                if (criteria && criteria.conditions && criteria.conditions.length > 0) {
                    if ((0, segments_service_1.evaluateCriteria)(criteria, record)) {
                        await drizzle_1.db
                            .update(drizzle_1.portfolioRecords)
                            .set({
                            segmentId: seg.id,
                            lastSegmentedAt: new Date(),
                            updatedAt: new Date(),
                        })
                            .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.id, record.id));
                        matched = true;
                        break;
                    }
                }
            }
            if (!matched && defaultSeg) {
                await drizzle_1.db
                    .update(drizzle_1.portfolioRecords)
                    .set({
                    segmentId: defaultSeg.id,
                    lastSegmentedAt: new Date(),
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.id, record.id));
            }
            processed++;
            if (processed % 100 === 0) {
                await drizzle_1.db
                    .update(drizzle_1.segmentationRuns)
                    .set({ processed })
                    .where((0, drizzle_orm_1.eq)(drizzle_1.segmentationRuns.id, runId));
            }
        }
        await drizzle_1.db
            .update(drizzle_1.segmentationRuns)
            .set({ status: 'completed', processed, completedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(drizzle_1.segmentationRuns.id, runId));
        return { processed, total: records.length };
    }
    async findByTenant(tenantId) {
        return drizzle_1.db
            .select()
            .from(drizzle_1.segmentationRuns)
            .where((0, drizzle_orm_1.eq)(drizzle_1.segmentationRuns.tenantId, tenantId))
            .orderBy(drizzle_1.segmentationRuns.createdAt)
            .execute();
    }
};
exports.SegmentationRunsService = SegmentationRunsService;
exports.SegmentationRunsService = SegmentationRunsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SegmentationRunsService);
//# sourceMappingURL=segmentation-runs.service.js.map