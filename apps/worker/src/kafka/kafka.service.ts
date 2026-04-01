import { Injectable, Logger } from '@nestjs/common';
import { db, jobQueue } from '@platform/drizzle';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);

  async handlePortfolioIngested(payload: any) {
    this.logger.log(`Worker handling ingest event for tenant: ${payload.tenantId}`);
    // Example: Create background processing job for DPD buckets logic mapping over the entire portfolio
    
    // Instead of locking thread, push to job_queue so we can track retries robustly
    try {
        await db.insert(jobQueue).values({
            tenantId: payload.tenantId,
            jobType: 'portfolio_ingest_recalc',
            payload: payload,
            status: 'pending',
            runAfter: new Date(),
            priority: 1 // High Priority
        });
        this.logger.log(`Job scheduled successfully in job_queue table for Tenant: ${payload.tenantId}`);
    } catch (err) {
        this.logger.error('Failed to create portfolio job', err);
    }
  }
}
