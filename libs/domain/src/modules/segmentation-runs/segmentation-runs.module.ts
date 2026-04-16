import { Module } from '@nestjs/common';
import { SegmentationRunsService } from './segmentation-runs.service';
import { JourneysModule } from '../journeys/journeys.module';

@Module({
  imports: [JourneysModule],
  providers: [SegmentationRunsService],
  exports: [SegmentationRunsService],
})
export class SegmentationRunsModule {}
