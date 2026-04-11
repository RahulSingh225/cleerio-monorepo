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
exports.TenantFieldRegistryController = void 0;
const common_1 = require("@nestjs/common");
const tenant_field_registry_service_1 = require("./tenant-field-registry.service");
const create_field_mapping_dto_1 = require("./dto/create-field-mapping.dto");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_1 = require("../../../../tenant");
const drizzle_1 = require("../../../../drizzle");
const drizzle_orm_1 = require("drizzle-orm");
let TenantFieldRegistryController = class TenantFieldRegistryController {
    registryService;
    constructor(registryService) {
        this.registryService = registryService;
    }
    async createMapping(createFieldMappingDto) {
        return this.registryService.insert({ ...createFieldMappingDto });
    }
    async getMapping() {
        return this.registryService.getMappingForTenant();
    }
    async getProfiles() {
        const tenantId = tenant_1.TenantContext.tenantId;
        return drizzle_1.db
            .select()
            .from(drizzle_1.portfolioMappingProfiles)
            .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioMappingProfiles.tenantId, tenantId))
            .orderBy(drizzle_1.portfolioMappingProfiles.createdAt)
            .execute();
    }
    async getProfile(id) {
        const [profile] = await drizzle_1.db
            .select()
            .from(drizzle_1.portfolioMappingProfiles)
            .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioMappingProfiles.id, id))
            .limit(1)
            .execute();
        return profile || null;
    }
    async createProfile(body) {
        const tenantId = tenant_1.TenantContext.tenantId;
        const [profile] = await drizzle_1.db
            .insert(drizzle_1.portfolioMappingProfiles)
            .values({
            tenantId: tenantId,
            name: body.name,
            description: body.description || null,
            mappings: body.mappings,
            headers: body.headers,
            fieldCount: Object.keys(body.mappings).length,
        })
            .returning();
        return profile;
    }
    async updateProfile(id, body) {
        const updateData = { updatedAt: new Date() };
        if (body.name)
            updateData.name = body.name;
        if (body.description !== undefined)
            updateData.description = body.description;
        if (body.mappings) {
            updateData.mappings = body.mappings;
            updateData.fieldCount = Object.keys(body.mappings).length;
        }
        if (body.headers)
            updateData.headers = body.headers;
        const [updated] = await drizzle_1.db
            .update(drizzle_1.portfolioMappingProfiles)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(drizzle_1.portfolioMappingProfiles.id, id))
            .returning();
        return updated;
    }
};
exports.TenantFieldRegistryController = TenantFieldRegistryController;
__decorate([
    (0, common_1.Post)('mapping'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({
        message: 'Field mapping successfully created',
        apiCode: 'FIELD_MAPPING_CREATED',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_field_mapping_dto_1.CreateFieldMappingDto]),
    __metadata("design:returntype", Promise)
], TenantFieldRegistryController.prototype, "createMapping", null);
__decorate([
    (0, common_1.Get)('mapping'),
    (0, common_2.ApiResponseConfig)({
        message: 'Field mappings retrieved successfully',
        apiCode: 'FIELD_MAPPINGS_RETRIEVED',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantFieldRegistryController.prototype, "getMapping", null);
__decorate([
    (0, common_1.Get)('profiles'),
    (0, common_2.ApiResponseConfig)({
        message: 'Mapping profiles retrieved',
        apiCode: 'MAPPING_PROFILES_RETRIEVED',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantFieldRegistryController.prototype, "getProfiles", null);
__decorate([
    (0, common_1.Get)('profiles/:id'),
    (0, common_2.ApiResponseConfig)({
        message: 'Mapping profile retrieved',
        apiCode: 'MAPPING_PROFILE_RETRIEVED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantFieldRegistryController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('profiles'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    (0, common_2.ApiResponseConfig)({
        message: 'Mapping profile created',
        apiCode: 'MAPPING_PROFILE_CREATED',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantFieldRegistryController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('profiles/:id'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    (0, common_2.ApiResponseConfig)({
        message: 'Mapping profile updated',
        apiCode: 'MAPPING_PROFILE_UPDATED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantFieldRegistryController.prototype, "updateProfile", null);
exports.TenantFieldRegistryController = TenantFieldRegistryController = __decorate([
    (0, common_1.Controller)('tenant-field-registry'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [tenant_field_registry_service_1.TenantFieldRegistryService])
], TenantFieldRegistryController);
//# sourceMappingURL=tenant-field-registry.controller.js.map