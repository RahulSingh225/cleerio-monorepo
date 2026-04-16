import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksModule as DomainWebhooksModule } from '@platform/domain';

@Module({
  imports: [DomainWebhooksModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
