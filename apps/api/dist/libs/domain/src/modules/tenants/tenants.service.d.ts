import { tenants } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class TenantsService extends BaseRepository<typeof tenants> {
    constructor();
    createTenant(data: typeof tenants.$inferInsert): Promise<{
        id: string;
        name: string;
        code: string;
        status: string;
        settings: unknown;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        deletedAt: Date | null;
    }[]>;
    getTenantByCode(code: string): Promise<{
        [x: string]: any;
    }>;
    getTenantById(id: string): Promise<{
        [x: string]: any;
    }>;
    updateTenant(id: string, data: Partial<typeof tenants.$inferInsert>): Promise<{
        id: string;
        name: string;
        code: string;
        status: string;
        settings: unknown;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        deletedAt: Date | null;
    }[]>;
}
