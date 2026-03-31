import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db, jobQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { eq, inArray, sql } from 'drizzle-orm';

@Injectable()
export class JobQueueService extends BaseRepository<typeof jobQueue> {
  private readonly logger = new Logger(JobQueueService.name);

  constructor() {
    // Note: Overriding default tenant behavior because workers pull tasks across ALL tenants globally,
    // but execute them per tenant inside the task payload.
    // BaseRepository is designed safely.
    super(jobQueue, db);
  }

  // Polls the DB every 5 seconds for pending jobs
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPendingJobs() {
    this.logger.log('Polling for pending jobs...');
    // We execute a raw driver level query using SKIP LOCKED
    // Drizzle currently supports raw SQL execution elegantly
    
    // Begin transaction for safe locking
    await this._db.transaction(async (tx) => {
        // Find 10 pending jobs concurrently locked by this worker
        const lockedJobsRes = await tx.execute<{ id: string }>(sql`
            SELECT id FROM job_queue
            WHERE status = 'pending' AND scheduled_for <= NOW()
            ORDER BY priority ASC, created_at ASC
            LIMIT 10
            FOR UPDATE SKIP LOCKED;
        `);
        
        const lockedIds = lockedJobsRes.rows.map(r => String(r.id));

        if (lockedIds.length > 0) {
            // Mark them as running instantly to prevent other crons grabbing them just in case
            await tx.update(jobQueue).set({ status: 'running', updatedAt: new Date() }).where(inArray(jobQueue.id, lockedIds));
            this.logger.log(`Locked and processing ${lockedIds.length} jobs.`);
            
            // Note: Inside a real production system, dispatch them async so transaction commits quickly.
            // For now, simulating processing
            for (const id of lockedIds) {
                // simulate job processing success
                await tx.update(jobQueue).set({ status: 'completed', updatedAt: new Date() }).where(eq(jobQueue.id, id));
            }
        }
    });
  }
}
