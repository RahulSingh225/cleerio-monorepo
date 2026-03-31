import { Module } from '@nestjs/common';
import { ChannelConfigsService } from './channel-configs.service';

@Module({
  providers: [ChannelConfigsService],
  exports: [ChannelConfigsService],
})
export class ChannelConfigsModule {}
