import { Module } from '@nestjs/common';
import { DataPointsService } from './data-points.service';

@Module({
  providers: [DataPointsService],
  exports: [DataPointsService],
})
export class DataPointsModule {}
