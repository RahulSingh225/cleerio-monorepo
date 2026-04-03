import { Injectable } from '@nestjs/common';
import { eq, and, lte, desc } from 'drizzle-orm';
import { db, scheduledJobs, jobQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class ScheduledJobsService extends BaseRepository<typeof scheduledJobs> {
  constructor() {
    super(scheduledJobs, db);
  }

  async findDueJobs() {
    return db
      .select()
      .from(scheduledJobs)
      .where(and(eq(scheduledJobs.isActive, true), lte(scheduledJobs.nextRunAt, new Date())));
  }

  async createScheduledJob(data: typeof scheduledJobs.$inferInsert) {
    return this._db.insert(scheduledJobs).values(data).returning();
  }

  async toggleActive(id: string, isActive: boolean) {
    return this.update(eq(scheduledJobs.id, id), { isActive, updatedAt: new Date() });
  }

  async updateLastRun(id: string, jobId: string, status: string, nextRunAt: Date) {
    return this._db.update(scheduledJobs).set({
      lastRunAt: new Date(),
      lastRunStatus: status,
      lastJobId: jobId,
      nextRunAt,
      updatedAt: new Date(),
    }).where(eq(scheduledJobs.id, id)).returning();
  }
}
