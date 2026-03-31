import { Module } from '@nestjs/common';
import { JobQueueModule } from './job-queue/job-queue.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [JobQueueModule, KafkaModule],
})
export class AppModule {}
