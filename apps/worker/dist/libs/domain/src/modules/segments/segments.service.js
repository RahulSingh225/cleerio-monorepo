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
exports.SegmentsService = void 0;
exports.evaluateCriteria = evaluateCriteria;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
function isGroup(c) {
    return 'logic' in c && 'conditions' in c;
}
const CORE_FIELDS = new Set([
    'user_id', 'mobile', 'name', 'product', 'employer_id',
    'outstanding', 'current_dpd', 'dpd_bucket', 'total_repaid',
]);
function evaluateCriteria(criteria, record) {
    const evalCondition = (cond) => {
        let fieldValue;
        if (CORE_FIELDS.has(cond.field)) {
            const camel = cond.field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
            fieldValue = record[camel];
        }
        else {
            fieldValue = record.dynamicFields?.[cond.field];
        }
        const numVal = Number(fieldValue);
        const numTarget = Number(cond.value);
        const isNumeric = !isNaN(numVal) && !isNaN(numTarget);
        switch (cond.operator) {
            case 'eq':
                return String(fieldValue) === String(cond.value);
            case 'neq':
                return String(fieldValue) !== String(cond.value);
            case 'gt':
                return isNumeric && numVal > numTarget;
            case 'gte':
                return isNumeric && numVal >= numTarget;
            case 'lt':
                return isNumeric && numVal < numTarget;
            case 'lte':
                return isNumeric && numVal <= numTarget;
            case 'in':
                return Array.isArray(cond.value) && cond.value.map(String).includes(String(fieldValue));
            case 'not_in':
                return Array.isArray(cond.value) && !cond.value.map(String).includes(String(fieldValue));
            case 'contains':
                return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(String(cond.value).toLowerCase());
            case 'between':
                if (!Array.isArray(cond.value) || cond.value.length !== 2)
                    return false;
                const [min, max] = cond.value.map(Number);
                return isNumeric && numVal >= min && numVal <= max;
            default:
                return false;
        }
    };
    const evalNode = (node) => {
        if (isGroup(node)) {
            return node.logic === 'AND'
                ? node.conditions.every(evalNode)
                : node.conditions.some(evalNode);
        }
        return evalCondition(node);
    };
    return evalNode(criteria);
}
let SegmentsService = class SegmentsService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.segments, drizzle_1.db);
    }
    async createSegment(data) {
        return this._db.insert(drizzle_1.segments).values(data).returning();
    }
    async findAllWithCounts() {
        const segmentList = await this.findMany({ orderBy: (0, drizzle_orm_1.desc)(drizzle_1.segments.priority) });
        const result = await Promise.all(segmentList.map(async (seg) => {
            const [countResult] = await this._db
                .select({ value: (0, drizzle_orm_1.count)() })
                .from(drizzle_1.portfolioRecords)
                .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.segmentId, seg.id))
                .execute();
            return { ...seg, recordCount: Number(countResult?.value || 0) };
        }));
        return result;
    }
    async findById(id) {
        return this.findFirst((0, drizzle_orm_1.eq)(drizzle_1.segments.id, id));
    }
    async updateSegment(id, data) {
        return this._db
            .update(drizzle_1.segments)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(drizzle_1.segments.id, id))
            .returning();
    }
    async deleteSegment(id) {
        return this._db
            .update(drizzle_1.segments)
            .set({ isActive: false, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(drizzle_1.segments.id, id))
            .returning();
    }
    async getDefaultSegment(tenantId) {
        const existing = await this._db
            .select()
            .from(drizzle_1.segments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.segments.tenantId, tenantId), (0, drizzle_orm_1.eq)(drizzle_1.segments.isDefault, true)))
            .limit(1)
            .execute();
        if (existing.length > 0)
            return existing[0];
        const [created] = await this._db
            .insert(drizzle_1.segments)
            .values({
            tenantId,
            name: 'Others',
            code: 'others',
            description: 'Default catch-all segment for unmatched records',
            isDefault: true,
            isActive: true,
            priority: 999,
            criteriaJsonb: { logic: 'AND', conditions: [] },
        })
            .returning();
        return created;
    }
    async getActiveSegmentsByPriority(tenantId) {
        return this._db
            .select()
            .from(drizzle_1.segments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.segments.tenantId, tenantId), (0, drizzle_orm_1.eq)(drizzle_1.segments.isActive, true)))
            .orderBy(drizzle_1.segments.priority)
            .execute();
    }
    async updateSuccessRate(segmentId, rate) {
        return this._db
            .update(drizzle_1.segments)
            .set({ successRate: String(rate), updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(drizzle_1.segments.id, segmentId))
            .returning();
    }
};
exports.SegmentsService = SegmentsService;
exports.SegmentsService = SegmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SegmentsService);
//# sourceMappingURL=segments.service.js.map