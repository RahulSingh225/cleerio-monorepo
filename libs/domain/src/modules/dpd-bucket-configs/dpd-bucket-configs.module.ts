import { Module } from '@nestjs/common';
import { DpdBucketConfigsService } from './dpd-bucket-configs.service';
import { DpdBucketConfigsController } from './dpd-bucket-configs.controller';

@Module({
  controllers: [DpdBucketConfigsController],
  providers: [DpdBucketConfigsService],
  exports: [DpdBucketConfigsService],
})
export class DpdBucketConfigsModule {}
