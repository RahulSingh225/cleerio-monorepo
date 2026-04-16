import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobQueueService } from './job-queue.service';
import {
  PortfoliosModule,
  PortfolioRecordsModule,
  DpdBucketConfigsModule,
  CommTemplatesModule,
  ChannelConfigsModule,
  CommEventsModule,
  DeliveryLogsModule,
  // V2 Modules
  SegmentationRunsModule,
  SegmentsModule,
  JourneysModule,
  WebhooksModule as DomainWebhooksModule,
} from '@platform/domain';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PortfoliosModule,
    PortfolioRecordsModule,
    DpdBucketConfigsModule,
    CommTemplatesModule,
    ChannelConfigsModule,
    CommEventsModule,
    DeliveryLogsModule,
    // V2 Modules
    SegmentationRunsModule,
    SegmentsModule,
    JourneysModule,
    DomainWebhooksModule,
  ],
  providers: [JobQueueService],
  exports: [JobQueueService],
})
export class JobQueueModule {}
