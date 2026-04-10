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
exports.RepaymentController = void 0;
const common_1 = require("@nestjs/common");
const repayment_service_1 = require("./repayment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_1 = require("../../../../tenant");
let RepaymentController = class RepaymentController {
    repaymentService;
    constructor(repaymentService) {
        this.repaymentService = repaymentService;
    }
    async createSync(body) {
        const tenantId = tenant_1.TenantContext.tenantId;
        const [sync] = await this.repaymentService.createSync({
            ...body,
            tenantId,
            status: 'pending',
            syncDate: body.syncDate || new Date().toISOString().split('T')[0],
        });
        return { data: sync };
    }
    async findAll() {
        const tenantId = tenant_1.TenantContext.tenantId;
        const data = await this.repaymentService.findSyncsByTenant(tenantId);
        return { data };
    }
    async findRecords(portfolioRecordId) {
        const data = await this.repaymentService.findRecordsByPortfolioRecord(portfolioRecordId);
        return { data };
    }
};
exports.RepaymentController = RepaymentController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RepaymentController.prototype, "createSync", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RepaymentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('records/:portfolioRecordId'),
    __param(0, (0, common_1.Param)('portfolioRecordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RepaymentController.prototype, "findRecords", null);
exports.RepaymentController = RepaymentController = __decorate([
    (0, common_1.Controller)('v1/repayment-syncs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [repayment_service_1.RepaymentService])
], RepaymentController);
//# sourceMappingURL=repayment.controller.js.map