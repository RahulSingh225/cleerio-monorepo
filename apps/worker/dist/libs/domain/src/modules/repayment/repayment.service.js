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
exports.RepaymentService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
let RepaymentService = class RepaymentService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.repaymentSyncs, drizzle_1.db);
    }
    async createSync(data) {
        return this._db.insert(drizzle_1.repaymentSyncs).values(data).returning();
    }
    async processSync(syncId, records) {
        const [sync] = await drizzle_1.db
            .select()
            .from(drizzle_1.repaymentSyncs)
            .where((0, drizzle_orm_1.eq)(drizzle_1.repaymentSyncs.id, syncId))
            .execute();
        if (!sync)
            throw new Error(`Repayment sync ${syncId} not found`);
        let updated = 0;
        for (const record of records) {
            const [portfolioRecord] = await drizzle_1.db
                .select()
                .from(drizzle_1.portfolioRecords)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.tenantId, sync.tenantId), (0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.userId, record.userId)))
                .limit(1)
                .execute();
            if (!portfolioRecord)
                continue;
            await drizzle_1.db.insert(drizzle_1.repaymentRecords).values({
                tenantId: sync.tenantId,
                portfolioRecordId: portfolioRecord.id,
                repaymentSyncId: syncId,
                paymentDate: record.paymentDate,
                amount: String(record.amount),
                paymentType: record.paymentType || 'payment',
                reference: record.reference,
            });
            const currentOutstanding = Number(portfolioRecord.outstanding || 0);
            const currentRepaid = Number(portfolioRecord.totalRepaid || 0);
            const newOutstanding = Math.max(0, currentOutstanding - record.amount);
            await drizzle_1.db
                .update(drizzle_1.portfolioRecords)
                .set({
                outstanding: String(newOutstanding),
                totalRepaid: String(currentRepaid + record.amount),
                lastRepaymentAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.id, portfolioRecord.id));
            updated++;
        }
        await drizzle_1.db
            .update(drizzle_1.repaymentSyncs)
            .set({ status: 'completed', recordsUpdated: updated })
            .where((0, drizzle_orm_1.eq)(drizzle_1.repaymentSyncs.id, syncId));
        return { syncId, updated };
    }
    async findSyncsByTenant(tenantId) {
        return drizzle_1.db
            .select()
            .from(drizzle_1.repaymentSyncs)
            .where((0, drizzle_orm_1.eq)(drizzle_1.repaymentSyncs.tenantId, tenantId))
            .orderBy(drizzle_1.repaymentSyncs.createdAt)
            .execute();
    }
    async findRecordsByPortfolioRecord(portfolioRecordId) {
        return drizzle_1.db
            .select()
            .from(drizzle_1.repaymentRecords)
            .where((0, drizzle_orm_1.eq)(drizzle_1.repaymentRecords.portfolioRecordId, portfolioRecordId))
            .orderBy(drizzle_1.repaymentRecords.paymentDate)
            .execute();
    }
};
exports.RepaymentService = RepaymentService;
exports.RepaymentService = RepaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RepaymentService);
//# sourceMappingURL=repayment.service.js.map