import { Module } from '@nestjs/common';
import { ChannelConfigsService } from './channel-configs.service';
import { ChannelConfigsController } from './channel-configs.controller';
import { GenericDispatcherService } from './generic-dispatcher.service';
import { CommTemplatesModule } from '../comm-templates/comm-templates.module';

@Module({
  imports: [CommTemplatesModule],
  controllers: [ChannelConfigsController],
  providers: [ChannelConfigsService, GenericDispatcherService],
  exports: [ChannelConfigsService, GenericDispatcherService],
})
export class ChannelConfigsModule {}
