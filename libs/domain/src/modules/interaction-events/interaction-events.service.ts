import { Injectable } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { db, interactionEvents } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class InteractionEventsService extends BaseRepository<typeof interactionEvents> {
  constructor() {
    super(interactionEvents, db);
  }

  async createInteraction(data: typeof interactionEvents.$inferInsert) {
    return this._db.insert(interactionEvents).values(data).returning();
  }

  async findByRecord(recordId: string) {
    return this.findMany({
      where: eq(interactionEvents.recordId, recordId),
      orderBy: desc(interactionEvents.createdAt),
    });
  }

  async findByTenant(tenantId: string, limit = 50) {
    return this.findMany({
      where: eq(interactionEvents.tenantId, tenantId),
      orderBy: desc(interactionEvents.createdAt),
      limit,
    });
  }
}
