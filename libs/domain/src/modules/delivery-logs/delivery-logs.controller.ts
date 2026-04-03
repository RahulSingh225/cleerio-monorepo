import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { DeliveryLogsService } from './delivery-logs.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { desc } from 'drizzle-orm';
import { deliveryLogs } from '@platform/drizzle';

@Controller('delivery-logs')
export class DeliveryLogsController {
  constructor(private readonly service: DeliveryLogsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiResponseConfig({ message: 'Delivery logs listed', apiCode: 'DELIVERY_LOGS_LISTED' })
  async findAll() {
    return this.service.findMany({ orderBy: desc(deliveryLogs.createdAt) });
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiResponseConfig({ message: 'Event delivery logs retrieved', apiCode: 'EVENT_DELIVERY_LOGS' })
  async findByEvent(@Param('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  // Public webhook endpoint — no auth (providers call this)
  @Post('webhooks/:provider')
  async handleWebhook(@Param('provider') provider: string, @Body() payload: any) {
    const msgId = payload.message_id || payload.messageId || payload.request_id;
    if (!msgId) return { received: true, processed: false };

    await this.service.updateFromWebhook(msgId, {
      deliveryStatus: payload.status || payload.type,
      deliveredAt: payload.delivered_at ? new Date(payload.delivered_at) : undefined,
      readAt: payload.read_at ? new Date(payload.read_at) : undefined,
      errorCode: payload.error_code,
      errorMessage: payload.error_message,
      callbackPayload: payload,
    });

    return { received: true, processed: true };
  }
}
