import { Injectable } from '@nestjs/common';
import { db, jobQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { desc, eq, and } from 'drizzle-orm';

@Injectable()
export class JobsService extends BaseRepository<typeof jobQueue> {
  constructor() {
    super(jobQueue, db);
  }

  async findAllJobs(limit = 50) {
    return this._db
      .select()
      .from(jobQueue)
      .orderBy(desc(jobQueue.createdAt))
      .limit(limit);
  }

  async findJobsByTenant(tenantId: string, limit = 50) {
    return this._db
      .select()
      .from(jobQueue)
      .where(eq(jobQueue.tenantId, tenantId))
      .orderBy(desc(jobQueue.createdAt))
      .limit(limit);
  }
}
