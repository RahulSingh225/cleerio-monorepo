import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobQueueModule } from './job-queue/job-queue.module';
import { KafkaModule } from './kafka/kafka.module';
import {
  PortfoliosModule,
  PortfolioRecordsModule,
  CommTemplatesModule,
  DpdBucketConfigsModule,
  CommEventsModule,
  DeliveryLogsModule,
  // V2 Modules
  SegmentsModule,
  SegmentationRunsModule,
  JourneysModule,
  InteractionEventsModule,
  RepaymentModule,
} from '@platform/domain';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JobQueueModule,
    KafkaModule,
    PortfoliosModule,
    PortfolioRecordsModule,
    CommTemplatesModule,
    DpdBucketConfigsModule,
    CommEventsModule,
    DeliveryLogsModule,
    // V2 Modules
    SegmentsModule,
    SegmentationRunsModule,
    JourneysModule,
    InteractionEventsModule,
    RepaymentModule,
  ],
})
export class AppModule {}
