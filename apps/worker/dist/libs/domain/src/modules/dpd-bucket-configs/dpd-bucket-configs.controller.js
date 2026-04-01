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
exports.DpdBucketConfigsController = void 0;
const common_1 = require("@nestjs/common");
const dpd_bucket_configs_service_1 = require("./dpd-bucket-configs.service");
const create_bucket_dto_1 = require("./dto/create-bucket.dto");
const common_2 = require("../../../../common/index.ts");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const tenant_1 = require("../../../../tenant/index.ts");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle/index.ts");
let DpdBucketConfigsController = class DpdBucketConfigsController {
    bucketService;
    constructor(bucketService) {
        this.bucketService = bucketService;
    }
    async create(createBucketDto) {
        return this.bucketService.insert(createBucketDto);
    }
    async findAll() {
        return this.bucketService.findMany();
    }
    async update(id, data) {
        return this.bucketService.update((0, drizzle_orm_1.eq)(drizzle_1.dpdBucketConfigs.id, id), data);
    }
};
exports.DpdBucketConfigsController = DpdBucketConfigsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({
        message: 'DPD Bucket successfully created',
        apiCode: 'BUCKET_CREATED',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bucket_dto_1.CreateBucketDto]),
    __metadata("design:returntype", Promise)
], DpdBucketConfigsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_2.ApiResponseConfig)({
        message: 'DPD Buckets retrieved successfully',
        apiCode: 'BUCKETS_RETRIEVED',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DpdBucketConfigsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('tenant_admin'),
    (0, common_2.ApiResponseConfig)({
        message: 'DPD Bucket updated successfully',
        apiCode: 'BUCKET_UPDATED',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DpdBucketConfigsController.prototype, "update", null);
exports.DpdBucketConfigsController = DpdBucketConfigsController = __decorate([
    (0, common_1.Controller)('dpd-bucket-configs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_1.TenantGuard),
    __metadata("design:paramtypes", [dpd_bucket_configs_service_1.DpdBucketConfigsService])
], DpdBucketConfigsController);
//# sourceMappingURL=dpd-bucket-configs.controller.js.map