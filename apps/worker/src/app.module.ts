import { Module } from '@nestjs/common';
import { JobQueueModule } from './job-queue/job-queue.module';
import { KafkaModule } from './kafka/kafka.module';
import {
  PortfoliosModule,
  PortfolioRecordsModule,
  WorkflowRulesModule,
  CommTemplatesModule,
  DpdBucketConfigsModule,
} from '@platform/domain';

@Module({
  imports: [
    JobQueueModule,
    KafkaModule,
    PortfoliosModule,
    PortfolioRecordsModule,
    WorkflowRulesModule,
    CommTemplatesModule,
    DpdBucketConfigsModule,
  ],
})
export class AppModule {}
