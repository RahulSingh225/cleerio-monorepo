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
exports.OptOutController = void 0;
const common_1 = require("@nestjs/common");
const opt_out_service_1 = require("./opt-out.service");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let OptOutController = class OptOutController {
    service;
    constructor(service) {
        this.service = service;
    }
    async addToOptOut(body, req) {
        return this.service.addToOptOut({ ...body, tenantId: req.user.tenantId });
    }
    async findAll() {
        return this.service.findMany();
    }
    async remove(id) {
        return this.service.removeFromOptOut(id);
    }
};
exports.OptOutController = OptOutController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    (0, common_2.ApiResponseConfig)({ message: 'Added to opt-out list', apiCode: 'OPT_OUT_ADDED' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OptOutController.prototype, "addToOptOut", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.ApiResponseConfig)({ message: 'Opt-out list retrieved', apiCode: 'OPT_OUT_LISTED' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OptOutController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({ message: 'Removed from opt-out list', apiCode: 'OPT_OUT_REMOVED' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OptOutController.prototype, "remove", null);
exports.OptOutController = OptOutController = __decorate([
    (0, common_1.Controller)('opt-out'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [opt_out_service_1.OptOutService])
], OptOutController);
//# sourceMappingURL=opt-out.controller.js.map