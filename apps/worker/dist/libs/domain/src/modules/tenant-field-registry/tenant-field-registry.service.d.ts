import { tenantFieldRegistry } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class TenantFieldRegistryService extends BaseRepository<typeof tenantFieldRegistry> {
    constructor();
    getMappingForTenant(): Promise<{
        [x: string]: any;
    }[]>;
}
