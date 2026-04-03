import { Module } from '@nestjs/common';
import { CommEventsController } from './comm-events.controller';
import { CommEventsService } from './comm-events.service';

@Module({
  controllers: [CommEventsController],
  providers: [CommEventsService],
  exports: [CommEventsService],
})
export class CommEventsModule {}
