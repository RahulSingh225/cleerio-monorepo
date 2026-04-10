import { auditLogs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class AuditLogsService extends BaseRepository<typeof auditLogs> {
    constructor();
    log(data: {
        tenantId?: string;
        actorId?: string;
        actorType: string;
        action: string;
        entityType?: string;
        entityId?: string;
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
    }): Promise<{
        id: string;
        createdAt: Date | null;
        tenantId: string | null;
        actorId: string | null;
        actorType: string | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        oldValue: unknown;
        newValue: unknown;
        ipAddress: string | null;
    }[]>;
    findAllFiltered(filters?: {
        action?: string;
        entityType?: string;
    }): Promise<{
        [x: string]: any;
    }[]>;
}
