import { Injectable } from '@nestjs/common';
import { db, commTemplates } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class CommTemplatesService extends BaseRepository<typeof commTemplates> {
  constructor() {
    super(commTemplates, db);
  }
}
