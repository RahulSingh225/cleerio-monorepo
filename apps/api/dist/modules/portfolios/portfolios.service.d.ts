import { SQL } from 'drizzle-orm';
import { portfolios } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';
export declare class PortfoliosService extends BaseRepository<typeof portfolios> {
    constructor();
    buildAccessFilter(user: AuthenticatedUser): SQL | undefined;
    findAllForUser(user: AuthenticatedUser): Promise<{
        [x: string]: any;
    }[]>;
    parseAndIngestCSV(fileBuffer: Buffer, tenantId: string): Promise<unknown>;
}
