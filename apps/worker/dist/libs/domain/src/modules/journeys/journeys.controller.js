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
exports.JourneysController = void 0;
const common_1 = require("@nestjs/common");
const journeys_service_1 = require("./journeys.service");
const journey_steps_service_1 = require("../journey-steps/journey-steps.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_1 = require("../../../../tenant");
let JourneysController = class JourneysController {
    journeysService;
    stepsService;
    constructor(journeysService, stepsService) {
        this.journeysService = journeysService;
        this.stepsService = stepsService;
    }
    async create(body) {
        const tenantId = tenant_1.TenantContext.tenantId;
        const [journey] = await this.journeysService.createJourney({
            ...body,
            tenantId,
        });
        return { data: journey };
    }
    async findAll() {
        const data = await this.journeysService.findAllWithDetails();
        return { data };
    }
    async findById(id) {
        const data = await this.journeysService.findByIdWithSteps(id);
        return { data };
    }
    async update(id, body) {
        const [updated] = await this.journeysService.updateJourney(id, body);
        return { data: updated };
    }
    async delete(id) {
        const [deleted] = await this.journeysService.deleteJourney(id);
        return { data: deleted };
    }
    async addStep(journeyId, body) {
        const [step] = await this.stepsService.createStep({ ...body, journeyId });
        return { data: step };
    }
    async updateStep(stepId, body) {
        const [updated] = await this.stepsService.updateStep(stepId, body);
        return { data: updated };
    }
    async deleteStep(stepId) {
        const [deleted] = await this.stepsService.deleteStep(stepId);
        return { data: deleted };
    }
    async reorderSteps(journeyId, body) {
        await this.stepsService.reorder(journeyId, body.stepIds);
        return { data: { success: true } };
    }
    async deploy(id) {
        const [activated] = await this.journeysService.activate(id);
        return { data: activated };
    }
};
exports.JourneysController = JourneysController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/steps'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "addStep", null);
__decorate([
    (0, common_1.Put)(':id/steps/:stepId'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Param)('stepId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "updateStep", null);
__decorate([
    (0, common_1.Delete)(':id/steps/:stepId'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Param)('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "deleteStep", null);
__decorate([
    (0, common_1.Put)(':id/steps/reorder'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "reorderSteps", null);
__decorate([
    (0, common_1.Post)(':id/deploy'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JourneysController.prototype, "deploy", null);
exports.JourneysController = JourneysController = __decorate([
    (0, common_1.Controller)('v1/journeys'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [journeys_service_1.JourneysService,
        journey_steps_service_1.JourneyStepsService])
], JourneysController);
//# sourceMappingURL=journeys.controller.js.map