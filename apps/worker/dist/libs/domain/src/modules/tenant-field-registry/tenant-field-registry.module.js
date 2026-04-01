"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantFieldRegistryModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_field_registry_service_1 = require("./tenant-field-registry.service");
const tenant_field_registry_controller_1 = require("./tenant-field-registry.controller");
let TenantFieldRegistryModule = class TenantFieldRegistryModule {
};
exports.TenantFieldRegistryModule = TenantFieldRegistryModule;
exports.TenantFieldRegistryModule = TenantFieldRegistryModule = __decorate([
    (0, common_1.Module)({
        controllers: [tenant_field_registry_controller_1.TenantFieldRegistryController],
        providers: [tenant_field_registry_service_1.TenantFieldRegistryService],
        exports: [tenant_field_registry_service_1.TenantFieldRegistryService],
    })
], TenantFieldRegistryModule);
//# sourceMappingURL=tenant-field-registry.module.js.map