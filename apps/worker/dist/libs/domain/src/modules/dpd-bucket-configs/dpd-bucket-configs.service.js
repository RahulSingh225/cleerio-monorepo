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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DpdBucketConfigsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_1 = require("../../../../drizzle/index.ts");
const repository_1 = require("@platform/drizzle/repository");
let DpdBucketConfigsService = class DpdBucketConfigsService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.dpdBucketConfigs, drizzle_1.db);
    }
    async resolveBucketForDpd(dpdValue) {
        const configs = await this.findMany();
        const sorted = configs.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        for (const config of sorted) {
            if (!config.isActive)
                continue;
            const inMin = dpdValue >= config.dpdMin;
            const inMax = config.dpdMax === null ? true : dpdValue <= config.dpdMax;
            if (inMin && inMax) {
                return config.bucketName;
            }
        }
        return null;
    }
};
exports.DpdBucketConfigsService = DpdBucketConfigsService;
exports.DpdBucketConfigsService = DpdBucketConfigsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DpdBucketConfigsService);
//# sourceMappingURL=dpd-bucket-configs.service.js.map