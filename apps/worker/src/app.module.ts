import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobQueueModule } from './job-queue/job-queue.module';
import { KafkaModule } from './kafka/kafka.module';
import {
  PortfoliosModule,
  PortfolioRecordsModule,
  WorkflowRulesModule,
  CommTemplatesModule,
  DpdBucketConfigsModule,
  CommEventsModule,
  DeliveryLogsModule,
  BatchRunsModule,
} from '@platform/domain';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    JobQueueModule,
    KafkaModule,
    PortfoliosModule,
    PortfolioRecordsModule,
    WorkflowRulesModule,
    CommTemplatesModule,
    DpdBucketConfigsModule,
    CommEventsModule,
    DeliveryLogsModule,
    BatchRunsModule,
  ],
})
export class AppModule {}
