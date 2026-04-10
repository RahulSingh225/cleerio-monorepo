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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioRecordsController = void 0;
const common_1 = require("@nestjs/common");
const portfolio_records_service_1 = require("./portfolio-records.service");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
let PortfolioRecordsController = class PortfolioRecordsController {
    recordsService;
    constructor(recordsService) {
        this.recordsService = recordsService;
    }
    async findByPortfolio(portfolioId, limit, offset) {
        return this.recordsService.findMany({
            where: (0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.portfolioId, portfolioId),
            limit: limit || 50,
            offset: offset || 0,
        });
    }
    async findOne(id) {
        return this.recordsService.findFirst((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.id, id));
    }
};
exports.PortfolioRecordsController = PortfolioRecordsController;
__decorate([
    (0, common_1.Get)('portfolio/:portfolioId'),
    (0, common_2.ApiResponseConfig)({
        message: 'Portfolio records retrieved successfully',
        apiCode: 'PORTFOLIO_RECORDS_RETRIEVED',
    }),
    __param(0, (0, common_1.Param)('portfolioId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PortfolioRecordsController.prototype, "findByPortfolio", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.ApiResponseConfig)({
        message: 'Record retrieved successfully',
        apiCode: 'RECORD_RETRIEVED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PortfolioRecordsController.prototype, "findOne", null);
exports.PortfolioRecordsController = PortfolioRecordsController = __decorate([
    (0, common_1.Controller)('portfolio-records'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [portfolio_records_service_1.PortfolioRecordsService])
], PortfolioRecordsController);
//# sourceMappingURL=portfolio-records.controller.js.map