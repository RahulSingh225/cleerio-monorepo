import { Injectable, Logger } from '@nestjs/common';
import { db, taskQueue } from '@platform/drizzle';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);

  async handlePortfolioIngested(payload: any) {
    this.logger.log(`Worker handling ingest event for tenant: ${payload.tenantId}`);

    try {
        await db.insert(taskQueue).values({
            tenantId: payload.tenantId,
            jobType: 'portfolio.ingest',
            payload: payload,
            status: 'pending',
            runAfter: new Date(),
            priority: 1,
        });
        this.logger.log(`Job scheduled successfully in task_queue for Tenant: ${payload.tenantId}`);
    } catch (err) {
        this.logger.error('Failed to create portfolio job', err);
    }
  }
}
