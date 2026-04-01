import { dpdBucketConfigs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class DpdBucketConfigsService extends BaseRepository<typeof dpdBucketConfigs> {
    constructor();
    resolveBucketForDpd(dpdValue: number): Promise<string | null>;
}
