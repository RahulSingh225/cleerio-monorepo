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
exports.EligibilityService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_1 = require("@platform/drizzle");
const drizzle_orm_1 = require("drizzle-orm");
const tenant_1 = require("@platform/tenant");
let EligibilityService = class EligibilityService {
    constructor() { }
    async evaluateRecordEligibility(recordId, channel) {
        const tenantId = tenant_1.TenantContext.tenantId;
        const [record] = await drizzle_1.db.select().from(drizzle_1.portfolioRecords)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.id, recordId), (0, drizzle_orm_1.eq)(drizzle_1.portfolioRecords.tenantId, tenantId)))
            .limit(1);
        if (!record)
            return { eligible: false, reason: 'RECORD_NOT_FOUND' };
        if (record.isOptedOut)
            return { eligible: false, reason: 'OPTED_OUT_RECORD' };
        const [optOutConfig] = await drizzle_1.db.select().from(drizzle_1.optOutList)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.optOutList.mobile, record.mobile), (0, drizzle_orm_1.eq)(drizzle_1.optOutList.tenantId, tenantId)))
            .limit(1);
        if (optOutConfig && (!optOutConfig.channel || optOutConfig.channel === channel)) {
            return { eligible: false, reason: 'DNC_LIST' };
        }
        const [channelConfig] = await drizzle_1.db.select().from(drizzle_1.channelConfigs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(drizzle_1.channelConfigs.channel, channel), (0, drizzle_orm_1.eq)(drizzle_1.channelConfigs.tenantId, tenantId)))
            .limit(1);
        if (!channelConfig || !channelConfig.isEnabled) {
            return { eligible: false, reason: 'CHANNEL_DISABLED' };
        }
        return { eligible: true };
    }
};
exports.EligibilityService = EligibilityService;
exports.EligibilityService = EligibilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EligibilityService);
//# sourceMappingURL=eligibility.service.js.map