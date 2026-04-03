import { Injectable } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { db, commEvents } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class CommEventsService extends BaseRepository<typeof commEvents> {
  constructor() {
    super(commEvents, db);
  }

  async findAllForTenant(filters?: { status?: string; channel?: string }) {
    const conditions: any[] = [];
    if (filters?.status) conditions.push(eq(commEvents.status, filters.status));
    if (filters?.channel) conditions.push(eq(commEvents.channel, filters.channel));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return this.findMany({ where, orderBy: desc(commEvents.createdAt) });
  }

  async findByRecord(recordId: string) {
    return this.findMany({ where: eq(commEvents.recordId, recordId) });
  }

  async cancelEvent(id: string) {
    return this.update(eq(commEvents.id, id), { status: 'cancelled' });
  }
}
