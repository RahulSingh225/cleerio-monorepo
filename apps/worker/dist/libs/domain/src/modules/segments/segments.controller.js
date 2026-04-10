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
exports.SegmentsController = void 0;
const common_1 = require("@nestjs/common");
const segments_service_1 = require("./segments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_1 = require("../../../../tenant");
let SegmentsController = class SegmentsController {
    segmentsService;
    constructor(segmentsService) {
        this.segmentsService = segmentsService;
    }
    async create(body) {
        const tenantId = tenant_1.TenantContext.tenantId;
        const [segment] = await this.segmentsService.createSegment({
            ...body,
            tenantId,
        });
        return { data: segment };
    }
    async findAll() {
        const data = await this.segmentsService.findAllWithCounts();
        return { data };
    }
    async findById(id) {
        const data = await this.segmentsService.findById(id);
        return { data };
    }
    async update(id, body) {
        const [updated] = await this.segmentsService.updateSegment(id, body);
        return { data: updated };
    }
    async delete(id) {
        const [deleted] = await this.segmentsService.deleteSegment(id);
        return { data: deleted };
    }
};
exports.SegmentsController = SegmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "delete", null);
exports.SegmentsController = SegmentsController = __decorate([
    (0, common_1.Controller)('v1/segments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [segments_service_1.SegmentsService])
], SegmentsController);
//# sourceMappingURL=segments.controller.js.map