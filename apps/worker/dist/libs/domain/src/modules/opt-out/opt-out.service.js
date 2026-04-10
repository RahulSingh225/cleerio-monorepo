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
exports.OptOutService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
let OptOutService = class OptOutService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.optOutList, drizzle_1.db);
    }
    async addToOptOut(data) {
        return this._db.insert(drizzle_1.optOutList).values(data).returning();
    }
    async removeFromOptOut(id) {
        return this._db.delete(drizzle_1.optOutList).where((0, drizzle_orm_1.eq)(drizzle_1.optOutList.id, id)).returning();
    }
    async checkOptOut(tenantId, mobile, channel) {
        const filters = [(0, drizzle_orm_1.eq)(drizzle_1.optOutList.mobile, mobile)];
        const results = await drizzle_1.db.select().from(drizzle_1.optOutList).where((0, drizzle_orm_1.eq)(drizzle_1.optOutList.mobile, mobile));
        return results.some(r => (!r.tenantId || r.tenantId === tenantId) &&
            (!r.channel || r.channel === channel));
    }
};
exports.OptOutService = OptOutService;
exports.OptOutService = OptOutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OptOutService);
//# sourceMappingURL=opt-out.service.js.map