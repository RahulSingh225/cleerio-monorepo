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
exports.AuditLogsController = void 0;
const common_1 = require("@nestjs/common");
const audit_logs_service_1 = require("./audit-logs.service");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AuditLogsController = class AuditLogsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAll(action, entityType) {
        return this.service.findAllFiltered({ action, entityType });
    }
};
exports.AuditLogsController = AuditLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('tenant_admin', 'platform_admin'),
    (0, common_2.ApiResponseConfig)({ message: 'Audit logs listed', apiCode: 'AUDIT_LOGS_LISTED' }),
    __param(0, (0, common_1.Query)('action')),
    __param(1, (0, common_1.Query)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditLogsController.prototype, "findAll", null);
exports.AuditLogsController = AuditLogsController = __decorate([
    (0, common_1.Controller)('audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [audit_logs_service_1.AuditLogsService])
], AuditLogsController);
//# sourceMappingURL=audit-logs.controller.js.map