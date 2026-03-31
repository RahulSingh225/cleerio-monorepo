import { eq, and, getTableColumns, SQL, count, SQLWrapper } from 'drizzle-orm';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { db, Database } from '../db';
import { TenantContext } from '../../tenant';

export abstract class BaseRepository<T extends AnyPgTable> {
  constructor(
    protected readonly table: T,
    protected readonly _db: Database = db,
  ) {}

  protected get tenantId(): string | null {
    return TenantContext.tenantId;
  }

  /**
   * Automatically scopes any query with tenant_id, preventing leaked cross-tenant access.
   */
  protected withTenant(filter?: SQL | SQLWrapper): SQL | undefined {
    const columns = getTableColumns(this.table) as Record<string, any>;

    // If table has a tenantId column, strictly enforce the tenant context
    if (columns['tenantId']) {
      const currentTenantId = this.tenantId;
      if (!currentTenantId) {
        throw new Error('Tenant context is strictly required for this table.');
      }

      const tenantFilter = eq(columns['tenantId'], currentTenantId);
      return filter ? and(tenantFilter, filter as SQL) : tenantFilter;
    }

    return filter as SQL | undefined;
  }

  /**
   * Returns a dynamic select query builder pre-scoped with tenant filters.
   */
  protected createQuery() {
    const filter = this.withTenant();
    const query = this._db.select().from(this.table as any).$dynamic();
    return filter ? query.where(filter) : query;
  }

  async findMany(options?: {
    where?: SQL | SQLWrapper;
    limit?: number;
    offset?: number;
    orderBy?: SQL | SQL[];
  }) {
    const filter = this.withTenant(options?.where);
    let query = this._db.select().from(this.table as any).$dynamic();

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
      query = query.orderBy(
        ...(Array.isArray(options.orderBy)
          ? options.orderBy
          : [options.orderBy]),
      );
    }

    return query.execute();
  }

  async findFirst(where?: SQL | SQLWrapper) {
    const filter = this.withTenant(where);
    let query = this._db.select().from(this.table as any).$dynamic();

    if (filter) {
      query = query.where(filter);
    }

    const [result] = await query.limit(1).execute();
    return result || null;
  }

  async count(where?: SQL | SQLWrapper): Promise<number> {
    const filter = this.withTenant(where);
    let query = this._db
      .select({ value: count() })
      .from(this.table as any)
      .$dynamic();

    if (filter) {
      query = query.where(filter);
    }

    const [result] = await query.execute();
    return Number(result?.value) || 0;
  }

  async insert(data: any | any[]) {
    // Note: In a real app, ensure tenantId is injected if missing from payload
    // but present in context.
    return this._db.insert(this.table as any).values(data).returning();
  }

  async update(where: SQL | SQLWrapper, data: any) {
    const filter = this.withTenant(where);
    if (!filter) throw new Error('Update requires a filter context.');
    return this._db.update(this.table as any).set(data).where(filter).returning();
  }

  async delete(where: SQL | SQLWrapper) {
    const filter = this.withTenant(where);
    if (!filter) throw new Error('Delete requires a filter context.');
    return this._db.delete(this.table as any).where(filter).returning();
  }
}
