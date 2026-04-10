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
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const jobs_service_1 = require("./jobs.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const common_2 = require("../../../../common");
let JobsController = class JobsController {
    jobsService;
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async findAll(limit) {
        return this.jobsService.findAllJobs(limit);
    }
    async findByTenant(tenantId, limit) {
        return this.jobsService.findJobsByTenant(tenantId, limit);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('platform_admin', 'platform_ops'),
    (0, common_2.ApiResponseConfig)({
        message: 'System jobs retrieved successfully',
        apiCode: 'JOBS_RETRIEVED',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tenant/:tenantId'),
    (0, roles_decorator_1.Roles)('platform_admin', 'platform_ops'),
    (0, common_2.ApiResponseConfig)({
        message: 'Tenant jobs retrieved successfully',
        apiCode: 'TENANT_JOBS_RETRIEVED',
    }),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findByTenant", null);
exports.JobsController = JobsController = __decorate([
    (0, common_1.Controller)('jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map