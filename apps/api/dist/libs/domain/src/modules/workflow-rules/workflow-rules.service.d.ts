import { workflowRules } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class WorkflowRulesService extends BaseRepository<typeof workflowRules> {
    constructor();
    fetchActiveRulesForBucket(bucketId: string): Promise<{
        [x: string]: any;
    }[]>;
}
