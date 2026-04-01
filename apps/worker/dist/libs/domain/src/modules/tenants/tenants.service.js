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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_1 = require("../../../../drizzle/index.ts");
const repository_1 = require("@platform/drizzle/repository");
let TenantsService = class TenantsService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.tenants, drizzle_1.db);
    }
    async createTenant(data) {
        return this._db.insert(drizzle_1.tenants).values(data).returning();
    }
    async getTenantByCode(code) {
        return this.findFirst((0, drizzle_orm_1.eq)(drizzle_1.tenants.code, code));
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TenantsService);
const drizzle_orm_1 = require("drizzle-orm");
//# sourceMappingURL=tenants.service.js.map