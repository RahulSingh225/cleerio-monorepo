"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const tenant_1 = require("@platform/tenant");
const auth_module_1 = require("./modules/auth/auth.module");
const tenant_field_registry_module_1 = require("./modules/tenant-field-registry/tenant-field-registry.module");
const portfolios_module_1 = require("./modules/portfolios/portfolios.module");
const portfolio_records_module_1 = require("./modules/portfolio-records/portfolio-records.module");
const dpd_bucket_configs_module_1 = require("./modules/dpd-bucket-configs/dpd-bucket-configs.module");
const channel_configs_module_1 = require("./modules/channel-configs/channel-configs.module");
const comm_templates_module_1 = require("./modules/comm-templates/comm-templates.module");
const workflow_rules_module_1 = require("./modules/workflow-rules/workflow-rules.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_1.TenantMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            tenant_field_registry_module_1.TenantFieldRegistryModule,
            portfolios_module_1.PortfoliosModule,
            portfolio_records_module_1.PortfolioRecordsModule,
            dpd_bucket_configs_module_1.DpdBucketConfigsModule,
            channel_configs_module_1.ChannelConfigsModule,
            comm_templates_module_1.CommTemplatesModule,
            workflow_rules_module_1.WorkflowRulesModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map