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
exports.CommEventsController = void 0;
const common_1 = require("@nestjs/common");
const comm_events_service_1 = require("./comm-events.service");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
let CommEventsController = class CommEventsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async findAll(status, channel) {
        return this.service.findAllForTenant({ status, channel });
    }
    async findOne(id) {
        return this.service.findFirst((0, drizzle_orm_1.eq)(drizzle_1.commEvents.id, id));
    }
    async findByRecord(recordId) {
        return this.service.findByRecord(recordId);
    }
    async cancel(id) {
        return this.service.cancelEvent(id);
    }
};
exports.CommEventsController = CommEventsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_2.ApiResponseConfig)({ message: 'Communication events listed', apiCode: 'COMM_EVENTS_LISTED' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommEventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.ApiResponseConfig)({ message: 'Communication event retrieved', apiCode: 'COMM_EVENT_RETRIEVED' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommEventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('record/:recordId'),
    (0, common_2.ApiResponseConfig)({ message: 'Record events retrieved', apiCode: 'RECORD_EVENTS_RETRIEVED' }),
    __param(0, (0, common_1.Param)('recordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommEventsController.prototype, "findByRecord", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, common_2.ApiResponseConfig)({ message: 'Communication event cancelled', apiCode: 'COMM_EVENT_CANCELLED' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommEventsController.prototype, "cancel", null);
exports.CommEventsController = CommEventsController = __decorate([
    (0, common_1.Controller)('comm-events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [comm_events_service_1.CommEventsService])
], CommEventsController);
//# sourceMappingURL=comm-events.controller.js.map