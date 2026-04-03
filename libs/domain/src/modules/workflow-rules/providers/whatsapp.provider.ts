import { Logger } from '@nestjs/common';
import { MessageProvider, ProviderResponse } from './provider.interface';

/**
 * WhatsApp stub adapter.
 * In production, integrate with Meta Graph API or Gupshup.
 */
export class WhatsappProvider implements MessageProvider {
  private readonly logger = new Logger(WhatsappProvider.name);

  async send(destination: string, body: string, config: any): Promise<ProviderResponse> {
    const mockMessageId = `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.logger.log(`WhatsApp STUB → ${destination}: "${body.substring(0, 50)}..." | ID: ${mockMessageId}`);

    return {
      success: true,
      messageId: mockMessageId,
      rawResponse: { type: 'success', message: 'STUB_MODE' },
    };
  }
}
