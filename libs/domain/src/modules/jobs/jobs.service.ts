import { Injectable } from '@nestjs/common';
import { db, taskQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { desc, eq, and } from 'drizzle-orm';

@Injectable()
export class JobsService extends BaseRepository<typeof taskQueue> {
  constructor() {
    super(taskQueue, db);
  }

  async findAllJobs(limit = 50) {
    return this._db
      .select()
      .from(taskQueue)
      .orderBy(desc(taskQueue.createdAt))
      .limit(limit);
  }

  async findJobsByTenant(tenantId: string, limit = 50) {
    return this._db
      .select()
      .from(taskQueue)
      .where(eq(taskQueue.tenantId, tenantId))
      .orderBy(desc(taskQueue.createdAt))
      .limit(limit);
  }
}
