import { ChannelConfigsService } from './channel-configs.service';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
export declare class ChannelConfigsController {
    private readonly channelService;
    constructor(channelService: ChannelConfigsService);
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
    update(channel: string, updateDto: UpdateChannelConfigDto): Promise<{
        [x: string]: any;
    }[]>;
}
