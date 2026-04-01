"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const tenant_1 = require("../../tenant");
class BaseRepository {
    table;
    _db;
    constructor(table, _db = db_1.db) {
        this.table = table;
        this._db = _db;
    }
    get tenantId() {
        return tenant_1.TenantContext.tenantId;
    }
    withTenant(filter) {
        const columns = (0, drizzle_orm_1.getTableColumns)(this.table);
        if (columns['tenantId']) {
            const currentTenantId = this.tenantId;
            if (!currentTenantId) {
                throw new Error('Tenant context is strictly required for this table.');
            }
            const tenantFilter = (0, drizzle_orm_1.eq)(columns['tenantId'], currentTenantId);
            return filter ? (0, drizzle_orm_1.and)(tenantFilter, filter) : tenantFilter;
        }
        return filter;
    }
    createQuery() {
        const filter = this.withTenant();
        const query = this._db.select().from(this.table).$dynamic();
        return filter ? query.where(filter) : query;
    }
    async findMany(options) {
        const filter = this.withTenant(options?.where);
        let query = this._db.select().from(this.table).$dynamic();
        if (filter) {
            query = query.where(filter);
        }
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        if (options?.offset) {
            query = query.offset(options.offset);
        }
        if (options?.orderBy) {
            query = query.orderBy(...(Array.isArray(options.orderBy)
                ? options.orderBy
                : [options.orderBy]));
        }
        return query.execute();
    }
    async findFirst(where) {
        const filter = this.withTenant(where);
        let query = this._db.select().from(this.table).$dynamic();
        if (filter) {
            query = query.where(filter);
        }
        const [result] = await query.limit(1).execute();
        return result || null;
    }
    async count(where) {
        const filter = this.withTenant(where);
        let query = this._db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(this.table)
            .$dynamic();
        if (filter) {
            query = query.where(filter);
        }
        const [result] = await query.execute();
        return Number(result?.value) || 0;
    }
    async insert(data) {
        return this._db.insert(this.table).values(data).returning();
    }
    async update(where, data) {
        const filter = this.withTenant(where);
        if (!filter)
            throw new Error('Update requires a filter context.');
        return this._db.update(this.table).set(data).where(filter).returning();
    }
    async delete(where) {
        const filter = this.withTenant(where);
        if (!filter)
            throw new Error('Delete requires a filter context.');
        return this._db.delete(this.table).where(filter).returning();
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map