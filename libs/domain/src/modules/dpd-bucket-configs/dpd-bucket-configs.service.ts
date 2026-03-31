import { Injectable } from '@nestjs/common';
import { db, dpdBucketConfigs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class DpdBucketConfigsService extends BaseRepository<typeof dpdBucketConfigs> {
  constructor() {
    super(dpdBucketConfigs, db);
  }

  async resolveBucketForDpd(dpdValue: number): Promise<string | null> {
    // Fetches evaluating boundaries correctly
    const configs = await this.findMany();
    // Sort by priority (lower number == evaluated first)
    const sorted = configs.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    for (const config of sorted) {
      if (!config.isActive) continue;
      
      const inMin = dpdValue >= config.dpdMin;
      const inMax = config.dpdMax === null ? true : dpdValue <= config.dpdMax;
      
      if (inMin && inMax) {
        return config.bucketName;
      }
    }
    
    return null;
  }
}
