"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_1 = require("../../../../libs/drizzle/index.ts");
let KafkaService = KafkaService_1 = class KafkaService {
    logger = new common_1.Logger(KafkaService_1.name);
    async handlePortfolioIngested(payload) {
        this.logger.log(`Worker handling ingest event for tenant: ${payload.tenantId}`);
        try {
            await drizzle_1.db.insert(drizzle_1.jobQueue).values({
                tenantId: payload.tenantId,
                jobType: 'portfolio_ingest_recalc',
                payload: payload,
                status: 'pending',
                runAfter: new Date(),
                priority: 1
            });
            this.logger.log(`Job scheduled successfully in job_queue table for Tenant: ${payload.tenantId}`);
        }
        catch (err) {
            this.logger.error('Failed to create portfolio job', err);
        }
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)()
], KafkaService);
//# sourceMappingURL=kafka.service.js.map