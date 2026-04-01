import { channelConfigs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class ChannelConfigsService extends BaseRepository<typeof channelConfigs> {
    constructor();
    getActiveChannel(channel: string): Promise<{
        [x: string]: any;
    } | undefined>;
}
