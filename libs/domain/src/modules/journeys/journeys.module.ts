import { Module } from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { JourneysController } from './journeys.controller';
import { JourneyStepsService } from '../journey-steps/journey-steps.service';
import { JourneyProgressionService } from './journey-progression.service';
import { SegmentsModule } from '../segments/segments.module';

@Module({
  imports: [SegmentsModule],
  controllers: [JourneysController],
  providers: [JourneysService, JourneyStepsService, JourneyProgressionService],
  exports: [JourneysService, JourneyStepsService, JourneyProgressionService],
})
export class JourneysModule {}
