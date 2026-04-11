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
exports.PortfolioRecordsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
let PortfolioRecordsService = class PortfolioRecordsService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.portfolioRecords, drizzle_1.db);
    }
    buildAccessFilter(user) {
        if (user.role === 'tenant_admin' || user.isPlatformUser) {
            return undefined;
        }
        return undefined;
    }
    async totalCount(filter) {
        const [result] = await this._db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(drizzle_1.portfolioRecords)
            .where(filter)
            .execute();
        return Number(result?.value || 0);
    }
    async insertBulkRecords(records) {
        const chunkSize = 500;
        let results = [];
        for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize);
            const inserted = await this._db.insert(drizzle_1.portfolioRecords).values(chunk).returning();
            results = results.concat(inserted);
        }
        return results;
    }
};
exports.PortfolioRecordsService = PortfolioRecordsService;
exports.PortfolioRecordsService = PortfolioRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PortfolioRecordsService);
//# sourceMappingURL=portfolio-records.service.js.map