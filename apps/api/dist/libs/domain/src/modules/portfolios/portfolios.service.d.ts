import { SQL } from 'drizzle-orm';
import { portfolios } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';
import { TenantFieldRegistryService } from '../tenant-field-registry/tenant-field-registry.service';
import { PortfolioRecordsService } from '../portfolio-records/portfolio-records.service';
export declare class PortfoliosService extends BaseRepository<typeof portfolios> {
    private readonly registryService;
    private readonly recordsService;
    private readonly logger;
    constructor(registryService: TenantFieldRegistryService, recordsService: PortfolioRecordsService);
    buildAccessFilter(user: AuthenticatedUser): SQL | undefined;
    findAllForUser(user: AuthenticatedUser): Promise<{
        [x: string]: any;
    }[]>;
    parseCsvHeadersAndPreview(fileBuffer: Buffer): Promise<{
        headers: string[];
        rows: any[];
    }>;
    parseAndIngestCSV(fileBuffer: Buffer, tenantId: string, portfolioId: string, userMappings?: Record<string, string>, profileId?: string, profileName?: string): Promise<unknown>;
    private coerceValue;
}
