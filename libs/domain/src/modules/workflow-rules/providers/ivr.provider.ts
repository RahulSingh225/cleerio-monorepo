import { Logger } from '@nestjs/common';
import { MessageProvider, ProviderResponse } from './provider.interface';

/**
 * IVR / Voice Bot stub adapter.
 * In production, integrate with Exotel or similar.
 */
export class IvrProvider implements MessageProvider {
  private readonly logger = new Logger(IvrProvider.name);

  async send(destination: string, body: string, config: any): Promise<ProviderResponse> {
    const mockMessageId = `ivr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.logger.log(`IVR STUB → ${destination}: script="${body.substring(0, 50)}..." | ID: ${mockMessageId}`);

    return {
      success: true,
      messageId: mockMessageId,
      rawResponse: { type: 'success', message: 'STUB_MODE' },
    };
  }
}
