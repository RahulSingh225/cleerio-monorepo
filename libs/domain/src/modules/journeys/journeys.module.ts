import { Module } from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { JourneysController } from './journeys.controller';
import { JourneyStepsService } from '../journey-steps/journey-steps.service';

@Module({
  controllers: [JourneysController],
  providers: [JourneysService, JourneyStepsService],
  exports: [JourneysService, JourneyStepsService],
})
export class JourneysModule {}
