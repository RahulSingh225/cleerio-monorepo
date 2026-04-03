import { Injectable, Logger } from '@nestjs/common';
import { MessageProvider, ProviderResponse } from './providers/provider.interface';
import { Msg91Provider } from './providers/msg91.provider';
import { WhatsappProvider } from './providers/whatsapp.provider';
import { IvrProvider } from './providers/ivr.provider';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);
  private readonly providers: Map<string, MessageProvider>;

  constructor() {
    this.providers = new Map<string, MessageProvider>([
      ['sms', new Msg91Provider()],
      ['whatsapp', new WhatsappProvider()],
      ['ivr', new IvrProvider()],
      ['voice_bot', new IvrProvider()],
    ]);
  }

  async dispatchMessage(
    channel: string,
    destination: string,
    body: string,
    providerConfig: any,
  ): Promise<ProviderResponse> {
    const provider = this.providers.get(channel);

    if (!provider) {
      this.logger.warn(`No provider registered for channel: ${channel}`);
      return {
        success: false,
        errorCode: 'UNKNOWN_CHANNEL',
        errorMessage: `No provider for channel: ${channel}`,
      };
    }

    this.logger.log(`Dispatching [${channel}] to <${destination}>: "${body.substring(0, 50)}..."`);
    return provider.send(destination, body, providerConfig);
  }
}
