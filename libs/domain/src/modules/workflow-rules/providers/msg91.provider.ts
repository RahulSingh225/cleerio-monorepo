import { Logger } from '@nestjs/common';
import { MessageProvider, ProviderResponse } from './provider.interface';
import axios from 'axios';

/**
 * MSG91 SMS adapter.
 * Docs: https://docs.msg91.com/reference/send-sms
 * Config shape expected in channel_configs.provider_config:
 * {
 *   authKey: "your_msg91_auth_key",
 *   senderId: "CLEEIO",
 *   templateId: "msg91_dlt_template_id",  // DLT compliance
 *   route: "4"  // transactional
 * }
 */
export class Msg91Provider implements MessageProvider {
  private readonly logger = new Logger(Msg91Provider.name);
  private readonly baseUrl = 'https://control.msg91.com/api/v5';

  async send(destination: string, body: string, config: any): Promise<ProviderResponse> {
    const { authKey, senderId, templateId, route = '4' } = config;

    if (!authKey) {
      return { success: false, errorCode: 'MISSING_AUTH_KEY', errorMessage: 'MSG91 authKey not configured' };
    }

    try {
      const payload = {
        sender: senderId || 'CLEEIO',
        route,
        country: '91',
        sms: [
          {
            message: body,
            to: [destination.replace(/^\+?91/, '')], // Strip country code prefix
          },
        ],
        // DLT template ID — required for Indian regulatory compliance
        ...(templateId && { DLT_TE_ID: templateId }),
      };

      this.logger.log(`MSG91 dispatch → ${destination}: "${body.substring(0, 50)}..."`);

      // In production, uncomment the actual API call:
      // const response = await axios.post(`${this.baseUrl}/flow/`, payload, {
      //   headers: { authkey: authKey, 'Content-Type': 'application/json' },
      // });
      // return {
      //   success: response.data.type === 'success',
      //   messageId: response.data.request_id,
      //   rawResponse: response.data,
      // };

      // STUB: Simulate success for development
      const mockMessageId = `msg91_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      this.logger.log(`MSG91 STUB — would send to ${destination}, mock ID: ${mockMessageId}`);

      return {
        success: true,
        messageId: mockMessageId,
        rawResponse: { type: 'success', request_id: mockMessageId, message: 'STUB_MODE' },
      };
    } catch (err: any) {
      this.logger.error(`MSG91 error: ${err.message}`);
      return {
        success: false,
        errorCode: 'MSG91_API_ERROR',
        errorMessage: err.message,
        rawResponse: err.response?.data,
      };
    }
  }
}
