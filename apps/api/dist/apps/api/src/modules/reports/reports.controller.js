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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const common_2 = require("../../../../../libs/common");
const domain_1 = require("../../../../../libs/domain/src");
const tenant_1 = require("../../../../../libs/tenant");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getSummary(req, portfolioId) {
        return this.reportsService.getPortfolioSummary(req.user.tenantId, portfolioId);
    }
    async getDpdDist(req) {
        return this.reportsService.getDpdDistribution(req.user.tenantId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('portfolio-summary'),
    (0, common_2.ApiResponseConfig)({
        message: 'Portfolio summary report generated successfully',
        apiCode: 'REPORT_SUMMARY_SUCCESS',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('portfolioId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('dpd-distribution'),
    (0, common_2.ApiResponseConfig)({
        message: 'DPD distribution report generated successfully',
        apiCode: 'REPORT_DPD_DIST_SUCCESS',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDpdDist", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(domain_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map