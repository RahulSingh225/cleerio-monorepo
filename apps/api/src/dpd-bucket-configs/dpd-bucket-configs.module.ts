import { Module } from '@nestjs/common';
import { DpdBucketConfigsService } from './dpd-bucket-configs.service';

@Module({
  providers: [DpdBucketConfigsService],
  exports: [DpdBucketConfigsService],
})
export class DpdBucketConfigsModule {}
