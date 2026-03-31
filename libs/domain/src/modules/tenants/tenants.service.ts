import { Injectable } from '@nestjs/common';
import { db, tenants } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class TenantsService extends BaseRepository<typeof tenants> {
  constructor() {
    super(tenants, db);
  }

  async createTenant(data: typeof tenants.$inferInsert) {
    return this._db.insert(tenants).values(data).returning();
  }

  async getTenantByCode(code: string) {
    return this.findFirst(eq(tenants.code, code));
  }
}
import { eq } from 'drizzle-orm';
