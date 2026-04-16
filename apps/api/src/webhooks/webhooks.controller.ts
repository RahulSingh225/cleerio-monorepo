import { Controller, Post, Param, Body, Headers, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { db, tenants } from '@platform/drizzle';
import { eq } from 'drizzle-orm';
import { CallbackNormalizerService, FeedbackProcessorService } from '@platform/domain';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly normalizer: CallbackNormalizerService,
    private readonly processor: FeedbackProcessorService,
  ) {}

  // ─── SMS WEBHOOKS ───────────────────────────────────────────

  @Post(':tenantCode/sms/delivery')
  async smsDelivery(
    @Param('tenantCode') tenantCode: string,
    @Body() body: any,
    @Headers('x-webhook-secret') secret?: string,
  ) {
    const tenant = await this.resolveTenant(tenantCode);
    this.logger.log(`SMS delivery webhook for tenant: ${tenantCode}`);

    const normalized = await this.normalizer.normalize(tenant.id, 'sms', body, 'msg91');
    await this.processor.process(normalized);

    return { received: true, status: normalized.deliveryStatus };
  }

  @Post(':tenantCode/sms/reply')
  async smsReply(
    @Param('tenantCode') tenantCode: string,
    @Body() body: any,
  ) {
    const tenant = await this.resolveTenant(tenantCode);
    this.logger.log(`SMS reply webhook for tenant: ${tenantCode}`);

    const normalized = await this.normalizer.normalize(tenant.id, 'sms', body, 'msg91');
    normalized.deliveryStatus = 'replied';
    normalized.replyContent = body.message || body.text || body.reply || '';
    normalized.repliedAt = new Date();
    await this.processor.process(normalized);

    return { received: true };
  }

  // ─── WHATSAPP WEBHOOKS ──────────────────────────────────────

  @Post(':tenantCode/whatsapp/delivery')
  async whatsappDelivery(
    @Param('tenantCode') tenantCode: string,
    @Body() body: any,
  ) {
    const tenant = await this.resolveTenant(tenantCode);
    this.logger.log(`WhatsApp delivery webhook for tenant: ${tenantCode}`);

    const normalized = await this.normalizer.normalize(tenant.id, 'whatsapp', body, 'wati');
    await this.processor.process(normalized);

    return { received: true, status: normalized.deliveryStatus };
  }

  @Post(':tenantCode/whatsapp/reply')
  async whatsappReply(
    @Param('tenantCode') tenantCode: string,
    @Body() body: any,
  ) {
    const tenant = await this.resolveTenant(tenantCode);
    this.logger.log(`WhatsApp reply webhook for tenant: ${tenantCode}`);

    const normalized = await this.normalizer.normalize(tenant.id, 'whatsapp', body, 'wati');
    // For reply webhooks, force the status to 'replied'
    if (body.text || body.message || body.body) {
      normalized.deliveryStatus = 'replied';
      normalized.replyContent = body.text || body.message || body.body || '';
      normalized.repliedAt = new Date();
    }
    await this.processor.process(normalized);

    return { received: true };
  }

  // ─── IVR WEBHOOKS (Boilerplate) ─────────────────────────────

  @Post(':tenantCode/ivr/status')
  async ivrStatus(
    @Param('tenantCode') tenantCode: string,
    @Body() body: any,
  ) {
    const tenant = await this.resolveTenant(tenantCode);
    this.logger.log(`IVR status webhook for tenant: ${tenantCode} (boilerplate — raw storage only)`);

    // Boilerplate: just store the raw payload, don't process
    const normalized = await this.normalizer.normalize(tenant.id, 'ivr', body);
    // Store in delivery_logs via processor but skip deep processing
    await this.processor.process(normalized);

    return { received: true, note: 'ivr_boilerplate' };
  }

  // ─── PAYMENT WEBHOOKS ──────────────────────────────────────

  @Post(':tenantCode/payment/status')
  async paymentStatus(
    @Param('tenantCode') tenantCode: string,
    @Body() body: any,
  ) {
    const tenant = await this.resolveTenant(tenantCode);
    this.logger.log(`Payment status webhook for tenant: ${tenantCode}`);

    // Payment link callbacks are treated as link_click + optional completion
    const normalized = await this.normalizer.normalize(tenant.id, 'sms', body);
    normalized.linkClicked = true;
    normalized.linkClickedAt = new Date();

    if (body.status === 'completed' || body.status === 'paid' || body.status === 'success') {
      // Payment completed — this is ultimately a repayment event
      this.logger.log(`Payment completed for tenant ${tenantCode}`);
    }

    await this.processor.process(normalized);

    return { received: true };
  }

  // ─── HELPER ────────────────────────────────────────────────

  private async resolveTenant(tenantCode: string) {
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.code, tenantCode))
      .limit(1);

    if (!tenant) {
      throw new HttpException(`Tenant not found: ${tenantCode}`, HttpStatus.NOT_FOUND);
    }

    return tenant;
  }
}
