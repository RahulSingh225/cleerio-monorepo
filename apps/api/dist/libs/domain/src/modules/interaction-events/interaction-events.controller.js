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
exports.InteractionEventsController = void 0;
const common_1 = require("@nestjs/common");
const interaction_events_service_1 = require("./interaction-events.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const tenant_1 = require("../../../../tenant");
let InteractionEventsController = class InteractionEventsController {
    interactionsService;
    constructor(interactionsService) {
        this.interactionsService = interactionsService;
    }
    async findAll(limit) {
        const tenantId = tenant_1.TenantContext.tenantId;
        const data = await this.interactionsService.findByTenant(tenantId, limit ? parseInt(limit) : 50);
        return { data };
    }
};
exports.InteractionEventsController = InteractionEventsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InteractionEventsController.prototype, "findAll", null);
exports.InteractionEventsController = InteractionEventsController = __decorate([
    (0, common_1.Controller)('interactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [interaction_events_service_1.InteractionEventsService])
], InteractionEventsController);
//# sourceMappingURL=interaction-events.controller.js.map