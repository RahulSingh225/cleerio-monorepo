import { Injectable } from '@nestjs/common';
import { db, channelConfigs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class ChannelConfigsService extends BaseRepository<typeof channelConfigs> {
  constructor() {
    super(channelConfigs, db);
  }

  async getActiveChannel(channel: string) {
    const list = await this.findMany();
    return list.find(c => c.channel === channel && c.isEnabled);
  }
}
