import { Module } from '@nestjs/common';
import { IvrSyncsController } from './ivr-syncs.controller';
import { IvrSyncsService } from './ivr-syncs.service';

@Module({
  controllers: [IvrSyncsController],
  providers: [IvrSyncsService],
  exports: [IvrSyncsService],
})
export class IvrSyncsModule {}
