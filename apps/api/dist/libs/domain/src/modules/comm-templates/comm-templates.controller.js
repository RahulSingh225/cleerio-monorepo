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
exports.CommTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const comm_templates_service_1 = require("./comm-templates.service");
const create_template_dto_1 = require("./dto/create-template.dto");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_1 = require("../../../../tenant");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
let CommTemplatesController = class CommTemplatesController {
    templateService;
    constructor(templateService) {
        this.templateService = templateService;
    }
    async create(createTemplateDto) {
        return this.templateService.insert(createTemplateDto);
    }
    async findAll() {
        return this.templateService.findMany();
    }
    async findOne(id) {
        return this.templateService.findFirst((0, drizzle_orm_1.eq)(drizzle_1.commTemplates.id, id));
    }
    async delete(id) {
        return this.templateService.delete((0, drizzle_orm_1.eq)(drizzle_1.commTemplates.id, id));
    }
};
exports.CommTemplatesController = CommTemplatesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_2.ApiResponseConfig)({
        message: 'Communication template created successfully',
        apiCode: 'TEMPLATE_CREATED',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], CommTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.ApiResponseConfig)({
        message: 'Communication templates listed successfully',
        apiCode: 'TEMPLATES_LISTED',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommTemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.ApiResponseConfig)({
        message: 'Template details retrieved successfully',
        apiCode: 'TEMPLATE_RETRIEVED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommTemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_2.ApiResponseConfig)({
        message: 'Template deleted successfully',
        apiCode: 'TEMPLATE_DELETED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommTemplatesController.prototype, "delete", null);
exports.CommTemplatesController = CommTemplatesController = __decorate([
    (0, common_1.Controller)('comm-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [comm_templates_service_1.CommTemplatesService])
], CommTemplatesController);
//# sourceMappingURL=comm-templates.controller.js.map