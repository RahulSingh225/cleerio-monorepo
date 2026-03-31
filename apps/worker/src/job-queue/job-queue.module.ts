import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobQueueService } from './job-queue.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [JobQueueService],
  exports: [JobQueueService],
})
export class JobQueueModule {}
