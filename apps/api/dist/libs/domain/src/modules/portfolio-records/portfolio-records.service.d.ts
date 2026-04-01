import { SQL } from 'drizzle-orm';
import { portfolioRecords } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';
export declare class PortfolioRecordsService extends BaseRepository<typeof portfolioRecords> {
    constructor();
    buildAccessFilter(user: AuthenticatedUser): SQL | undefined;
    insertBulkRecords(records: any[]): Promise<{
        id: string;
        name: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        portfolioId: string;
        userId: string;
        mobile: string;
        product: string | null;
        employerId: string | null;
        currentDpd: number | null;
        dpdBucket: string | null;
        overdue: string | null;
        outstanding: string | null;
        dynamicFields: unknown;
        isOptedOut: boolean | null;
        lastSyncedAt: Date | null;
    }[]>;
}
