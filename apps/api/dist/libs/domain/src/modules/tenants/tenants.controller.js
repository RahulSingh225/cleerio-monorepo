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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
let TenantsController = class TenantsController {
    tenantsService;
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async create(createTenantDto) {
        return this.tenantsService.createTenant(createTenantDto);
    }
    async findOne(code) {
        return this.tenantsService.getTenantByCode(code);
    }
    async findAll() {
        return this.tenantsService.findMany();
    }
    async findById(id) {
        return this.tenantsService.getTenantById(id);
    }
    async update(id, data) {
        return this.tenantsService.updateTenant(id, data);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant created successfully', apiCode: 'TENANT_CREATED' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':code'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant retrieved successfully', apiCode: 'TENANT_RETRIEVED' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('platform_admin', 'platform_ops'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenants listed successfully', apiCode: 'TENANTS_LISTED' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-id/:id'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant retrieved by ID', apiCode: 'TENANT_BY_ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(tenant_role_guard_1.TenantRoleGuard),
    (0, roles_decorator_1.Roles)('platform_admin'),
    (0, common_2.ApiResponseConfig)({ message: 'Tenant updated successfully', apiCode: 'TENANT_UPDATED' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "update", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)('tenants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map