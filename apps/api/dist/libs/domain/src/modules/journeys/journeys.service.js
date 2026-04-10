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
exports.JourneysService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
let JourneysService = class JourneysService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.journeys, drizzle_1.db);
    }
    async createJourney(data) {
        return this._db.insert(drizzle_1.journeys).values(data).returning();
    }
    async findAllWithDetails() {
        const journeyList = await this.findMany({ orderBy: (0, drizzle_orm_1.desc)(drizzle_1.journeys.createdAt) });
        const result = await Promise.all(journeyList.map(async (j) => {
            const [stepCount] = await this._db
                .select({ value: (0, drizzle_orm_1.count)() })
                .from(drizzle_1.journeySteps)
                .where((0, drizzle_orm_1.eq)(drizzle_1.journeySteps.journeyId, j.id))
                .execute();
            const [seg] = await this._db
                .select()
                .from(drizzle_1.segments)
                .where((0, drizzle_orm_1.eq)(drizzle_1.segments.id, j.segmentId))
                .limit(1)
                .execute();
            return {
                ...j,
                stepCount: Number(stepCount?.value || 0),
                segment: seg || null,
            };
        }));
        return result;
    }
    async findByIdWithSteps(id) {
        const journey = await this.findFirst((0, drizzle_orm_1.eq)(drizzle_1.journeys.id, id));
        if (!journey)
            return null;
        const steps = await this._db
            .select()
            .from(drizzle_1.journeySteps)
            .where((0, drizzle_orm_1.eq)(drizzle_1.journeySteps.journeyId, id))
            .orderBy(drizzle_1.journeySteps.stepOrder)
            .execute();
        const [seg] = await this._db
            .select()
            .from(drizzle_1.segments)
            .where((0, drizzle_orm_1.eq)(drizzle_1.segments.id, journey.segmentId))
            .limit(1)
            .execute();
        return { ...journey, steps, segment: seg || null };
    }
    async updateJourney(id, data) {
        return this._db
            .update(drizzle_1.journeys)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(drizzle_1.journeys.id, id))
            .returning();
    }
    async deleteJourney(id) {
        await this._db.delete(drizzle_1.journeySteps).where((0, drizzle_orm_1.eq)(drizzle_1.journeySteps.journeyId, id));
        return this._db.delete(drizzle_1.journeys).where((0, drizzle_orm_1.eq)(drizzle_1.journeys.id, id)).returning();
    }
    async activate(id) {
        return this.updateJourney(id, { isActive: true });
    }
    async deactivate(id) {
        return this.updateJourney(id, { isActive: false });
    }
};
exports.JourneysService = JourneysService;
exports.JourneysService = JourneysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JourneysService);
//# sourceMappingURL=journeys.service.js.map