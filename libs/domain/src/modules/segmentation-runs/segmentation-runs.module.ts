import { Module } from '@nestjs/common';
import { SegmentationRunsService } from './segmentation-runs.service';

@Module({
  providers: [SegmentationRunsService],
  exports: [SegmentationRunsService],
})
export class SegmentationRunsModule {}
