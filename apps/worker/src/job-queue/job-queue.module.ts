import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobQueueService } from './job-queue.service';
import {
  PortfoliosModule,
  PortfolioRecordsModule,
  WorkflowRulesModule,
  DpdBucketConfigsModule,
  CommTemplatesModule,
} from '@platform/domain';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PortfoliosModule,
    PortfolioRecordsModule,
    WorkflowRulesModule,
    DpdBucketConfigsModule,
    CommTemplatesModule,
  ],
  providers: [JobQueueService],
  exports: [JobQueueService],
})
export class JobQueueModule {}
