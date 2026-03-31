import { eq, and, getTableColumns, SQL } from 'drizzle-orm';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { db, Database } from '../db';
import { TenantContext } from '../../tenant'; // Assuming relative import resolving nicely in monorepo

export abstract class BaseRepository<T extends AnyPgTable> {
  constructor(protected readonly table: T, protected readonly _db: Database = db) {}

  protected get tenantId(): string | null {
    return TenantContext.tenantId;
  }

  /**
   * Automatically scopes any query with tenant_id, preventing leaked cross-tenant access.
   */
  protected withTenant(filter?: SQL): SQL | undefined {
    const columns = getTableColumns(this.table) as Record<string, any>;
    
    // If table has a tenantId column, strictly enforce the tenant context
    if (columns['tenantId']) {
      const currentTenantId = this.tenantId;
      if (!currentTenantId) {
        throw new Error('Tenant context is strictly required for this table.');
      }
      
      const tenantFilter = eq(columns['tenantId'], currentTenantId);
      return filter ? and(tenantFilter, filter) : tenantFilter;
    }
    
    return filter;
  }

  async findMany(options?: { where?: SQL; limit?: number; offset?: number }) {
    const filter = this.withTenant(options?.where);
    
    // Using Drizzle's $dynamic() explicitly allows chaining queries conditionally
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

    return query.execute();
  }

  async findFirst(where?: SQL) {
    const filter = this.withTenant(where);
    let query = this._db.select().from(this.table as any).$dynamic();
    
    if (filter) {
      query = query.where(filter);
    }

    const [result] = await query.limit(1).execute();
    return result || null;
  }
}
