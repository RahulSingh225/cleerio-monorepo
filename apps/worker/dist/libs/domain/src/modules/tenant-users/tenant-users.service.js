"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantUsersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcrypt"));
const drizzle_1 = require("../../../../drizzle");
const repository_1 = require("../../../../drizzle/repository");
let TenantUsersService = class TenantUsersService extends repository_1.BaseRepository {
    constructor() {
        super(drizzle_1.tenantUsers, drizzle_1.db);
    }
    async createUser(data) {
        const passwordHash = await bcrypt.hash(data.password, 10);
        return this._db
            .insert(drizzle_1.tenantUsers)
            .values({
            tenantId: data.tenantId,
            email: data.email,
            name: data.name,
            passwordHash,
            role: data.role,
            status: 'active',
            invitedBy: data.invitedBy,
        })
            .returning();
    }
    async updateUser(id, data) {
        const updateData = { updatedAt: new Date() };
        if (data.name)
            updateData.name = data.name;
        if (data.role)
            updateData.role = data.role;
        if (data.status)
            updateData.status = data.status;
        if (data.password)
            updateData.passwordHash = await bcrypt.hash(data.password, 10);
        return this.update((0, drizzle_orm_1.eq)(drizzle_1.tenantUsers.id, id), updateData);
    }
    async deactivateUser(id) {
        return this.update((0, drizzle_orm_1.eq)(drizzle_1.tenantUsers.id, id), { status: 'inactive', updatedAt: new Date() });
    }
};
exports.TenantUsersService = TenantUsersService;
exports.TenantUsersService = TenantUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TenantUsersService);
//# sourceMappingURL=tenant-users.service.js.map