import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { db, deliveryLogs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class DeliveryLogsService extends BaseRepository<typeof deliveryLogs> {
  constructor() {
    super(deliveryLogs, db);
  }

  async createLog(data: typeof deliveryLogs.$inferInsert) {
    return this._db.insert(deliveryLogs).values(data).returning();
  }

  async findByEvent(eventId: string) {
    return this.findMany({ where: eq(deliveryLogs.eventId, eventId) });
  }

  async updateFromWebhook(providerMsgId: string, data: {
    deliveryStatus?: string;
    deliveredAt?: Date;
    readAt?: Date;
    errorCode?: string;
    errorMessage?: string;
    callbackPayload?: any;
  }) {
    return this._db.update(deliveryLogs).set(data).where(eq(deliveryLogs.providerMsgId, providerMsgId)).returning();
  }
}
