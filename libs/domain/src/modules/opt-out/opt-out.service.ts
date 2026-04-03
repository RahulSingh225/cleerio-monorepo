import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db, optOutList } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class OptOutService extends BaseRepository<typeof optOutList> {
  constructor() {
    super(optOutList, db);
  }

  async addToOptOut(data: {
    tenantId?: string;
    mobile: string;
    channel?: string;
    reason?: string;
    source?: string;
  }) {
    return this._db.insert(optOutList).values(data).returning();
  }

  async removeFromOptOut(id: string) {
    return this._db.delete(optOutList).where(eq(optOutList.id, id)).returning();
  }

  async checkOptOut(tenantId: string, mobile: string, channel?: string): Promise<boolean> {
    const filters = [eq(optOutList.mobile, mobile)];
    // Check both tenant-specific and global (null tenantId) opt-outs
    const results = await db.select().from(optOutList).where(eq(optOutList.mobile, mobile));
    return results.some(r =>
      (!r.tenantId || r.tenantId === tenantId) &&
      (!r.channel || r.channel === channel)
    );
  }
}
