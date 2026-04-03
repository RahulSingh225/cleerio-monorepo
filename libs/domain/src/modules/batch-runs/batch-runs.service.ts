import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { db, batchRuns, batchErrors } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class BatchRunsService extends BaseRepository<typeof batchRuns> {
  constructor() {
    super(batchRuns, db);
  }

  async findAllForTenant() {
    return this.findMany({ orderBy: desc(batchRuns.createdAt) });
  }

  async getErrorsForBatch(batchRunId: string) {
    return db.select().from(batchErrors).where(eq(batchErrors.batchRunId, batchRunId));
  }

  async createBatchRun(data: typeof batchRuns.$inferInsert) {
    return this._db.insert(batchRuns).values(data).returning();
  }

  async updateProgress(id: string, progress: { processed?: number; succeeded?: number; failed?: number; skipped?: number; status?: string }) {
    const updateData: any = { ...progress };
    if (progress.status === 'completed' || progress.status === 'failed') {
      updateData.completedAt = new Date();
    }
    return this._db.update(batchRuns).set(updateData).where(eq(batchRuns.id, id)).returning();
  }

  async logError(data: typeof batchErrors.$inferInsert) {
    return db.insert(batchErrors).values(data).returning();
  }
}
