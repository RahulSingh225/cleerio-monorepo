import { Module } from '@nestjs/common';
import { RepaymentSyncsController } from './repayment-syncs.controller';
import { RepaymentSyncsService } from './repayment-syncs.service';
import { DpdBucketConfigsModule } from '../dpd-bucket-configs/dpd-bucket-configs.module';

@Module({
  imports: [DpdBucketConfigsModule],
  controllers: [RepaymentSyncsController],
  providers: [RepaymentSyncsService],
  exports: [RepaymentSyncsService],
})
export class RepaymentSyncsModule {}
