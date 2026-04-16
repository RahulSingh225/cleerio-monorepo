import { Module } from '@nestjs/common';
import { DataPointsController } from './data-points.controller';
import { DataPointsModule as DomainDataPointsModule } from '@platform/domain';

@Module({
  imports: [DomainDataPointsModule],
  controllers: [DataPointsController],
})
export class DataPointsModule {}
