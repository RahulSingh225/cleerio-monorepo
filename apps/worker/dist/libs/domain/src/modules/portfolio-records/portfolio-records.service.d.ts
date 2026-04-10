import { SQL } from 'drizzle-orm';
import { portfolioRecords } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';
export declare class PortfolioRecordsService extends BaseRepository<typeof portfolioRecords> {
    constructor();
    buildAccessFilter(user: AuthenticatedUser): SQL | undefined;
    insertBulkRecords(records: any[]): Promise<any[]>;
}
