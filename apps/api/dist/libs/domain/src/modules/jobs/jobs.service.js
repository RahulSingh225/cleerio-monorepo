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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
const drizzle_orm_1 = require("drizzle-orm");
let JobsService = class JobsService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.taskQueue, drizzle_1.db);
    }
    async findAllJobs(limit = 50) {
        return this._db
            .select()
            .from(drizzle_1.taskQueue)
            .orderBy((0, drizzle_orm_1.desc)(drizzle_1.taskQueue.createdAt))
            .limit(limit);
    }
    async findJobsByTenant(tenantId, limit = 50) {
        return this._db
            .select()
            .from(drizzle_1.taskQueue)
            .where((0, drizzle_orm_1.eq)(drizzle_1.taskQueue.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.desc)(drizzle_1.taskQueue.createdAt))
            .limit(limit);
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JobsService);
//# sourceMappingURL=jobs.service.js.map