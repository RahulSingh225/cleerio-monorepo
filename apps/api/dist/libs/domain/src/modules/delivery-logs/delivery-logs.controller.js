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
exports.DeliveryLogsController = void 0;
const common_1 = require("@nestjs/common");
const delivery_logs_service_1 = require("./delivery-logs.service");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
let DeliveryLogsController = class DeliveryLogsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        return this.service.findMany({ orderBy: (0, drizzle_orm_1.desc)(drizzle_1.deliveryLogs.createdAt) });
    }
    async findByEvent(eventId) {
        return this.service.findByEvent(eventId);
    }
    async handleWebhook(provider, payload) {
        const msgId = payload.message_id || payload.messageId || payload.request_id;
        if (!msgId)
            return { received: true, processed: false };
        await this.service.updateFromWebhook(msgId, {
            deliveryStatus: payload.status || payload.type,
            deliveredAt: payload.delivered_at ? new Date(payload.delivered_at) : undefined,
            readAt: payload.read_at ? new Date(payload.read_at) : undefined,
            errorCode: payload.error_code,
            errorMessage: payload.error_message,
            callbackPayload: payload,
        });
        return { received: true, processed: true };
    }
};
exports.DeliveryLogsController = DeliveryLogsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    (0, common_2.ApiResponseConfig)({ message: 'Delivery logs listed', apiCode: 'DELIVERY_LOGS_LISTED' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    (0, common_2.ApiResponseConfig)({ message: 'Event delivery logs retrieved', apiCode: 'EVENT_DELIVERY_LOGS' }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryLogsController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Post)('webhooks/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryLogsController.prototype, "handleWebhook", null);
exports.DeliveryLogsController = DeliveryLogsController = __decorate([
    (0, common_1.Controller)('delivery-logs'),
    __metadata("design:paramtypes", [delivery_logs_service_1.DeliveryLogsService])
], DeliveryLogsController);
//# sourceMappingURL=delivery-logs.controller.js.map