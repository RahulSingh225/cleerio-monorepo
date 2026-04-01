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
exports.PortfoliosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const tenant_1 = require("../../../../tenant");
const common_2 = require("../../../../common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_role_guard_1 = require("../auth/guards/tenant-role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const portfolios_service_1 = require("./portfolios.service");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
let PortfoliosController = class PortfoliosController {
    portfoliosService;
    constructor(portfoliosService) {
        this.portfoliosService = portfoliosService;
    }
    async uploadPortfolio(file, tenant, req) {
        const results = await this.portfoliosService.insert({
            tenantId: tenant.tenantId,
            uploadedBy: req.user.userId,
            allocationMonth: new Date().toISOString().substring(0, 7),
            sourceType: 'csv',
            status: 'processing',
        });
        const newPortfolio = results[0];
        this.portfoliosService.parseAndIngestCSV(file.buffer, tenant.tenantId, newPortfolio.id);
        return newPortfolio;
    }
    async findAll(req) {
        return this.portfoliosService.findAllForUser(req.user);
    }
    async findOne(id) {
        return this.portfoliosService.findFirst((0, drizzle_orm_1.eq)(drizzle_1.portfolios.id, id));
    }
    async delete(id) {
        return this.portfoliosService.delete((0, drizzle_orm_1.eq)(drizzle_1.portfolios.id, id));
    }
};
exports.PortfoliosController = PortfoliosController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)('tenant_admin', 'ops'),
    (0, common_2.ApiResponseConfig)({
        message: 'Portfolio successfully uploaded and processing started',
        apiCode: 'PORTFOLIO_UPLOAD_STARTED',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, tenant_1.CurrentTenant)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "uploadPortfolio", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.ApiResponseConfig)({
        message: 'Portfolios listed successfully',
        apiCode: 'PORTFOLIOS_LISTED',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_2.ApiResponseConfig)({
        message: 'Portfolio details retrieved successfully',
        apiCode: 'PORTFOLIO_RETRIEVED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({
        message: 'Portfolio and its records deleted successfully',
        apiCode: 'PORTFOLIO_DELETED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PortfoliosController.prototype, "delete", null);
exports.PortfoliosController = PortfoliosController = __decorate([
    (0, common_1.Controller)('portfolios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard, tenant_role_guard_1.TenantRoleGuard),
    __metadata("design:paramtypes", [portfolios_service_1.PortfoliosService])
], PortfoliosController);
//# sourceMappingURL=portfolios.controller.js.map