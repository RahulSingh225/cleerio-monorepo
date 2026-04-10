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
exports.InteractionEventsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
let InteractionEventsService = class InteractionEventsService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.interactionEvents, drizzle_1.db);
    }
    async createInteraction(data) {
        return this._db.insert(drizzle_1.interactionEvents).values(data).returning();
    }
    async findByRecord(recordId) {
        return this.findMany({
            where: (0, drizzle_orm_1.eq)(drizzle_1.interactionEvents.recordId, recordId),
            orderBy: (0, drizzle_orm_1.desc)(drizzle_1.interactionEvents.createdAt),
        });
    }
    async findByTenant(tenantId, limit = 50) {
        return this.findMany({
            where: (0, drizzle_orm_1.eq)(drizzle_1.interactionEvents.tenantId, tenantId),
            orderBy: (0, drizzle_orm_1.desc)(drizzle_1.interactionEvents.createdAt),
            limit,
        });
    }
};
exports.InteractionEventsService = InteractionEventsService;
exports.InteractionEventsService = InteractionEventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], InteractionEventsService);
//# sourceMappingURL=interaction-events.service.js.map