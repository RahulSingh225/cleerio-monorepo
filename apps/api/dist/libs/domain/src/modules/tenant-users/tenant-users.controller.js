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
exports.TenantUsersController = void 0;
const common_1 = require("@nestjs/common");
const tenant_users_service_1 = require("./tenant-users.service");
const create_tenant_user_dto_1 = require("./dto/create-tenant-user.dto");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
let TenantUsersController = class TenantUsersController {
    tenantUsersService;
    constructor(tenantUsersService) {
        this.tenantUsersService = tenantUsersService;
    }
    async create(dto, req) {
        return this.tenantUsersService.createUser({
            ...dto,
            tenantId: req.user.tenantId,
            invitedBy: req.user.userId,
        });
    }
    async findAll() {
        return this.tenantUsersService.findMany();
    }
    async findOne(id) {
        return this.tenantUsersService.findFirst((0, drizzle_orm_1.eq)(drizzle_1.tenantUsers.id, id));
    }
    async update(id, dto) {
        return this.tenantUsersService.updateUser(id, dto);
    }
    async deactivate(id) {
        return this.tenantUsersService.deactivateUser(id);
    }
};
exports.TenantUsersController = TenantUsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant user created successfully', apiCode: 'TENANT_USER_CREATED' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_user_dto_1.CreateTenantUserDto, Object]),
    __metadata("design:returntype", Promise)
], TenantUsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant users listed successfully', apiCode: 'TENANT_USERS_LISTED' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantUsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant user retrieved successfully', apiCode: 'TENANT_USER_RETRIEVED' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantUsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant user updated successfully', apiCode: 'TENANT_USER_UPDATED' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_tenant_user_dto_1.UpdateTenantUserDto]),
    __metadata("design:returntype", Promise)
], TenantUsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant user deactivated successfully', apiCode: 'TENANT_USER_DEACTIVATED' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantUsersController.prototype, "deactivate", null);
exports.TenantUsersController = TenantUsersController = __decorate([
    (0, common_1.Controller)('tenant-users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [tenant_users_service_1.TenantUsersService])
], TenantUsersController);
//# sourceMappingURL=tenant-users.controller.js.map