import { SQL } from 'drizzle-orm';
import { portfolios } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { AuthenticatedUser } from '@platform/common';
import { TenantFieldRegistryService } from '../tenant-field-registry/tenant-field-registry.service';
import { DpdBucketConfigsService } from '../dpd-bucket-configs/dpd-bucket-configs.service';
import { PortfolioRecordsService } from '../portfolio-records/portfolio-records.service';
export declare class PortfoliosService extends BaseRepository<typeof portfolios> {
    private readonly registryService;
    private readonly bucketService;
    private readonly recordsService;
    private readonly logger;
    constructor(registryService: TenantFieldRegistryService, bucketService: DpdBucketConfigsService, recordsService: PortfolioRecordsService);
    buildAccessFilter(user: AuthenticatedUser): SQL | undefined;
    findAllForUser(user: AuthenticatedUser): Promise<{
        [x: string]: any;
    }[]>;
    parseAndIngestCSV(fileBuffer: Buffer, tenantId: string, portfolioId: string): Promise<unknown>;
    private coerceValue;
}
