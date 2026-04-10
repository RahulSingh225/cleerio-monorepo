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
exports.ReportJobsController = void 0;
const common_1 = require("@nestjs/common");
const report_jobs_service_1 = require("./report-jobs.service");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
let ReportJobsController = class ReportJobsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async request(body, req) {
        return this.service.requestReport({
            tenantId: req.user.tenantId,
            requestedBy: req.user.userId,
            reportType: body.reportType,
            filters: body.filters,
        });
    }
    async findAll() {
        return this.service.findAllForTenant();
    }
    async findOne(id) {
        return this.service.findFirst((0, drizzle_orm_1.eq)(drizzle_1.reportJobs.id, id));
    }
};
exports.ReportJobsController = ReportJobsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_2.ApiResponseConfig)({ message: 'Report requested', apiCode: 'REPORT_REQUESTED' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportJobsController.prototype, "request", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.ApiResponseConfig)({ message: 'Report jobs listed', apiCode: 'REPORT_JOBS_LISTED' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportJobsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.ApiResponseConfig)({ message: 'Report job retrieved', apiCode: 'REPORT_JOB_RETRIEVED' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportJobsController.prototype, "findOne", null);
exports.ReportJobsController = ReportJobsController = __decorate([
    (0, common_1.Controller)('report-jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [report_jobs_service_1.ReportJobsService])
], ReportJobsController);
//# sourceMappingURL=report-jobs.controller.js.map