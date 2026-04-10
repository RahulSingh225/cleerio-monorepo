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
const tenant_1 = require("../../../libs/tenant");
const domain_1 = require("../../../libs/domain/src");
const reports_module_1 = require("./modules/reports/reports.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_1.TenantMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            domain_1.AuthModule,
            domain_1.TenantsModule,
            domain_1.TenantUsersModule,
            domain_1.TenantFieldRegistryModule,
            domain_1.PortfoliosModule,
            domain_1.PortfolioRecordsModule,
            domain_1.DpdBucketConfigsModule,
            domain_1.ChannelConfigsModule,
            domain_1.CommTemplatesModule,
            domain_1.JobsModule,
            reports_module_1.ReportsModule,
            domain_1.OptOutModule,
            domain_1.CommEventsModule,
            domain_1.DeliveryLogsModule,
            domain_1.AuditLogsModule,
            domain_1.ReportJobsModule,
            domain_1.SegmentsModule,
            domain_1.SegmentationRunsModule,
            domain_1.JourneysModule,
            domain_1.InteractionEventsModule,
            domain_1.RepaymentModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map