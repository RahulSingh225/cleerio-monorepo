"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfoliosModule = void 0;
const common_1 = require("@nestjs/common");
const portfolios_controller_1 = require("./portfolios.controller");
const portfolios_service_1 = require("./portfolios.service");
const tenant_field_registry_module_1 = require("../tenant-field-registry/tenant-field-registry.module");
const dpd_bucket_configs_module_1 = require("../dpd-bucket-configs/dpd-bucket-configs.module");
const portfolio_records_module_1 = require("../portfolio-records/portfolio-records.module");
let PortfoliosModule = class PortfoliosModule {
};
exports.PortfoliosModule = PortfoliosModule;
exports.PortfoliosModule = PortfoliosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            tenant_field_registry_module_1.TenantFieldRegistryModule,
            dpd_bucket_configs_module_1.DpdBucketConfigsModule,
            portfolio_records_module_1.PortfolioRecordsModule,
        ],
        controllers: [portfolios_controller_1.PortfoliosController],
        providers: [portfolios_service_1.PortfoliosService],
        exports: [portfolios_service_1.PortfoliosService],
    })
], PortfoliosModule);
//# sourceMappingURL=portfolios.module.js.map