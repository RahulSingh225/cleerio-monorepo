import { Module } from '@nestjs/common';
import { PaymentLinksController } from './payment-links.controller';
import { PaymentLinksModule as DomainPaymentLinksModule } from '@platform/domain';

@Module({
  imports: [DomainPaymentLinksModule],
  controllers: [PaymentLinksController],
})
export class PaymentLinksModule {}
