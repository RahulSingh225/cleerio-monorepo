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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_1 = require("../../../../../libs/drizzle");
const drizzle_orm_1 = require("drizzle-orm");
let ReportsService = class ReportsService {
    constructor() { }
    async getPortfolioSummary(tenantId, portfolioId) {
        const filters = [(0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.tenantId, tenantId)];
        if (portfolioId) {
            filters.push((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.portfolioId, portfolioId));
        }
        const [result] = await drizzle_1.db
            .select({
            totalRecords: (0, drizzle_orm_1.count)(),
            totalOutstanding: (0, drizzle_orm_1.sum)(drizzle_1.portfolioRecords.outstanding),
            totalRepaid: (0, drizzle_orm_1.sum)(drizzle_1.portfolioRecords.totalRepaid),
            activeBorrowers: (0, drizzle_orm_1.count)(drizzle_1.portfolioRecords.id),
        })
            .from(drizzle_1.portfolioRecords)
            .where((0, drizzle_orm_1.and)(...filters));
        return {
            totalRecords: Number(result?.totalRecords) || 0,
            totalOutstanding: result?.totalOutstanding || '0',
            totalRepaid: result?.totalRepaid || '0',
            activeBorrowers: Number(result?.activeBorrowers) || 0,
            portfolioId: portfolioId || 'ALL',
        };
    }
    async getDpdDistribution(tenantId) {
        return drizzle_1.db
            .select({
            bucket: drizzle_1.portfolioRecords.dpdBucket,
            count: (0, drizzle_orm_1.count)(),
            totalOverdue: (0, drizzle_orm_1.sum)(drizzle_1.portfolioRecords.outstanding),
        })
            .from(drizzle_1.portfolioRecords)
            .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.tenantId, tenantId))
            .groupBy(drizzle_1.portfolioRecords.dpdBucket);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ReportsService);
//# sourceMappingURL=reports.service.js.map