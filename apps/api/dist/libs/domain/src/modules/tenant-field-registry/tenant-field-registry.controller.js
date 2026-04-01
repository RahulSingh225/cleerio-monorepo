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
exports.TenantFieldRegistryController = TenantFieldRegistryController = __decorate([
    (0, common_1.Controller)('tenant-field-registry'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [tenant_field_registry_service_1.TenantFieldRegistryService])
], TenantFieldRegistryController);
//# sourceMappingURL=tenant-field-registry.controller.js.map