import { Module } from '@nestjs/common';
import { InteractionEventsService } from './interaction-events.service';
import { InteractionEventsController } from './interaction-events.controller';

@Module({
  controllers: [InteractionEventsController],
  providers: [InteractionEventsService],
  exports: [InteractionEventsService],
})
export class InteractionEventsModule {}
