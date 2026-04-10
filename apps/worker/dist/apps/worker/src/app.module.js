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
const schedule_1 = require("@nestjs/schedule");
const job_queue_module_1 = require("./job-queue/job-queue.module");
const kafka_module_1 = require("./kafka/kafka.module");
const domain_1 = require("../../../libs/domain/src");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            job_queue_module_1.JobQueueModule,
            kafka_module_1.KafkaModule,
            domain_1.PortfoliosModule,
            domain_1.PortfolioRecordsModule,
            domain_1.CommTemplatesModule,
            domain_1.DpdBucketConfigsModule,
            domain_1.CommEventsModule,
            domain_1.DeliveryLogsModule,
            domain_1.SegmentsModule,
            domain_1.SegmentationRunsModule,
            domain_1.JourneysModule,
            domain_1.InteractionEventsModule,
            domain_1.RepaymentModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map