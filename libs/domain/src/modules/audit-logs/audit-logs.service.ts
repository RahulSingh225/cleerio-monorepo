import { Injectable } from '@nestjs/common';
import { desc, eq, and } from 'drizzle-orm';
import { db, auditLogs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class AuditLogsService extends BaseRepository<typeof auditLogs> {
  constructor() {
    super(auditLogs, db);
  }

  /**
   * Helper used by other services to record audit trail entries.
   */
  async log(data: {
    tenantId?: string;
    actorId?: string;
    actorType: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
  }) {
    return this._db.insert(auditLogs).values(data).returning();
  }

  async findAllFiltered(filters?: { action?: string; entityType?: string }) {
    const conditions: any[] = [];
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters?.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return this.findMany({ where, orderBy: desc(auditLogs.createdAt) });
  }
}
