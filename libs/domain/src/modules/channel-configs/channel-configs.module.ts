import { Module } from '@nestjs/common';
import { ChannelConfigsService } from './channel-configs.service';
import { ChannelConfigsController } from './channel-configs.controller';

@Module({
  controllers: [ChannelConfigsController],
  providers: [ChannelConfigsService],
  exports: [ChannelConfigsService],
})
export class ChannelConfigsModule {}
