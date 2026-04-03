import { Injectable } from '@nestjs/common';
import { eq, and, asc } from 'drizzle-orm';
import { db, workflowRules, dpdBucketConfigs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class WorkflowRulesService extends BaseRepository<typeof workflowRules> {
  constructor() {
    super(workflowRules, db);
  }

  async fetchActiveRulesForBucket(bucketId: string) {
    return this.findMany({
      where: and(eq(workflowRules.bucketId, bucketId), eq(workflowRules.isActive, true)),
      orderBy: asc(workflowRules.priority),
    });
  }

  /**
   * Resolve bucket name (e.g. "Bucket 2") to the dpd_bucket_configs UUID,
   * then fetch active workflow rules for that bucket.
   */
  async fetchActiveRulesForBucketName(tenantId: string, bucketName: string) {
    const [bucket] = await db
      .select()
      .from(dpdBucketConfigs)
      .where(and(eq(dpdBucketConfigs.tenantId, tenantId), eq(dpdBucketConfigs.bucketName, bucketName)))
      .limit(1);

    if (!bucket) return [];

    return this.fetchActiveRulesForBucket(bucket.id);
  }
}
