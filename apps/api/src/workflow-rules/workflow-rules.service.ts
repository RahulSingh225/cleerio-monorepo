import { Injectable } from '@nestjs/common';
import { db, workflowRules } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class WorkflowRulesService extends BaseRepository<typeof workflowRules> {
  constructor() {
    super(workflowRules, db);
  }

  async fetchActiveRulesForBucket(bucketId: string) {
    const list = await this.findMany();
    return list.filter(r => r.bucketId === bucketId && r.isActive).sort((a, b) => a.priority - b.priority);
  }
}
