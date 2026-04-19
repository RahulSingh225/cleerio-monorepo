import { Injectable, Logger } from '@nestjs/common';
import { db, channelConfigs } from '@platform/drizzle';
import { eq, and } from 'drizzle-orm';

/**
 * Normalized callback format — the universal shape for all vendor webhooks.
 */
export interface NormalizedCallback {
  providerMsgId: string;
  tenantId: string;
  channel: 'sms' | 'whatsapp' | 'ivr' | 'voice_bot';

  // Delivery Status
  deliveryStatus: 'sent' | 'delivered' | 'read' | 'failed' | 'replied';
  deliveredAt?: Date;
  readAt?: Date;
  repliedAt?: Date;

  // Failure Details
  failureReason?: string;
  errorCode?: string;

  // Link Tracking
  linkClicked?: boolean;
  linkClickedAt?: Date;

  // Reply Content
  replyContent?: string;

  // Mobile number from callback (for fallback matching)
  mobileNumber?: string;

  // IVR Specific (boilerplate)
  callDuration?: number;
  callStatus?: string;
  recordingUrl?: string;

  // PTP Detection
  ptpDetected?: boolean;
  ptpDate?: string;
  ptpAmount?: number;

  // Raw
  rawPayload: any;
}

/**
 * Preset vendor payload maps for known providers.
 */
const VENDOR_PRESETS: Record<string, any> = {
  msg91: {
    msgIdField: 'requestId',
    telNumField: 'telNum',       // Mobile number for fallback matching
    statusField: 'event',        // MSG91 sends 'event: "delivered"' — more reliable than numeric 'status'
    statusMap: {
      // String event names (primary — from actual callback data)
      'delivered': 'delivered',
      'failed': 'failed',
      'sent': 'sent',
      'rejected': 'failed',
      'autorejected': 'failed',
      'dropped': 'failed',
      // Numeric fallbacks (legacy / some endpoints)
      '1': 'delivered', '2': 'failed', '3': 'delivered', '9': 'sent', '25': 'failed', '26': 'failed',
    },
    failureReasonField: 'failureReason',  // MSG91 actual field name (was incorrectly 'description')
  },
  wati: {
    msgIdField: 'id',
    statusField: 'eventType',
    statusMap: {
      message_sent: 'sent',
      message_delivered: 'delivered',
      message_read: 'read',
      message_failed: 'failed',
    },
    replyField: 'text',
    replyEventType: 'message_received',
    readTimestampField: 'timestamp',
  },
  gupshup: {
    msgIdField: 'externalId',
    statusField: 'type',
    statusMap: {
      enqueued: 'sent',
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
    },
    failureReasonField: 'payload.reason',
  },
};

@Injectable()
export class CallbackNormalizerService {
  private readonly logger = new Logger(CallbackNormalizerService.name);

  /**
   * Normalizes a raw vendor webhook payload into a NormalizedCallback.
   */
  async normalize(
    tenantId: string,
    channel: 'sms' | 'whatsapp' | 'ivr' | 'voice_bot',
    rawPayload: any,
    providerName?: string,
  ): Promise<NormalizedCallback> {
    // 1. Try to load the channel config's custom payload map
    let payloadMap: any = null;

    if (providerName) {
      // Check if we have a preset for this provider
      payloadMap = VENDOR_PRESETS[providerName.toLowerCase()] || null;
    }

    if (!payloadMap) {
      // Try loading from channel config
      const [config] = await db
        .select()
        .from(channelConfigs)
        .where(and(
          eq(channelConfigs.tenantId, tenantId),
          eq(channelConfigs.channel, channel),
          eq(channelConfigs.isEnabled, true),
        ))
        .limit(1);

      if (config?.callbackPayloadMap && Object.keys(config.callbackPayloadMap as any).length > 0) {
        payloadMap = config.callbackPayloadMap;
      } else if (config?.providerName) {
        payloadMap = VENDOR_PRESETS[config.providerName.toLowerCase()] || null;
      }
    }

    // 2. Normalize using the payload map (or best-effort generic extraction)
    const normalized: NormalizedCallback = {
      providerMsgId: this.extractField(rawPayload, payloadMap?.msgIdField) || `raw_${Date.now()}`,
      tenantId,
      channel,
      deliveryStatus: 'sent',
      rawPayload,
    };

    // Extract delivery status
    if (payloadMap?.statusField) {
      const rawStatus = this.extractField(rawPayload, payloadMap.statusField);
      if (rawStatus && payloadMap.statusMap) {
        normalized.deliveryStatus = payloadMap.statusMap[rawStatus] || rawStatus;
      }
    }

    // Extract timestamps
    if (normalized.deliveryStatus === 'delivered') {
      normalized.deliveredAt = new Date();
    }
    if (normalized.deliveryStatus === 'read') {
      normalized.deliveredAt = normalized.deliveredAt || new Date();
      normalized.readAt = new Date();
    }

    // Extract failure reason
    if (normalized.deliveryStatus === 'failed') {
      normalized.failureReason = this.extractField(rawPayload, payloadMap?.failureReasonField)
        || rawPayload.reason || rawPayload.description || rawPayload.error || 'unknown';
      normalized.errorCode = rawPayload.errorCode || rawPayload.code || null;

      // Classify common failure reasons
      const reason = (normalized.failureReason || '').toLowerCase();
      if (reason.includes('invalid') || reason.includes('not found') || reason.includes('wrong number')) {
        normalized.failureReason = 'invalid_number';
      } else if (reason.includes('dnd') || reason.includes('do not disturb') || reason.includes('opted out')) {
        normalized.failureReason = 'dnd_opted_out';
      } else if (reason.includes('whatsapp') && (reason.includes('not') || reason.includes('absent'))) {
        normalized.failureReason = 'number_not_on_whatsapp';
      } else if (reason.includes('template') && reason.includes('reject')) {
        normalized.failureReason = 'template_rejected';
      }
    }

    // Extract reply content (WhatsApp incoming messages)
    if (payloadMap?.replyField) {
      const replyText = this.extractField(rawPayload, payloadMap.replyField);
      if (replyText) {
        normalized.deliveryStatus = 'replied';
        normalized.replyContent = replyText;
        normalized.repliedAt = new Date();

        // PTP Detection (keyword matching)
        this.detectPtp(normalized, replyText);
      }
    }

    // Handle generic reply detection (for providers without preset)
    if (!payloadMap?.replyField && rawPayload.text) {
      normalized.deliveryStatus = 'replied';
      normalized.replyContent = rawPayload.text;
      normalized.repliedAt = new Date();
      this.detectPtp(normalized, rawPayload.text);
    }

    // Extract mobile number from callback payload (for fallback matching when providerMsgId fails)
    if (payloadMap?.telNumField) {
      const telNum = this.extractField(rawPayload, payloadMap.telNumField);
      if (telNum) {
        // Normalize: ensure country code prefix (91 for India)
        normalized.mobileNumber = telNum.startsWith('91') ? telNum : `91${telNum}`;
      }
    } else if (rawPayload.telNum || rawPayload.mobile || rawPayload.phone) {
      const telNum = rawPayload.telNum || rawPayload.mobile || rawPayload.phone;
      normalized.mobileNumber = telNum.startsWith('91') ? telNum : `91${telNum}`;
    }

    this.logger.debug(`Normalized callback: ${channel} → ${normalized.deliveryStatus} (msgId: ${normalized.providerMsgId}, mobile: ${normalized.mobileNumber || 'unknown'})`);
    return normalized;
  }

  /**
   * PTP (Promise to Pay) detection via keyword matching.
   * Detected PTPs are flagged for manual review (ptpStatus: 'pending_review').
   */
  private detectPtp(normalized: NormalizedCallback, text: string) {
    const lower = text.toLowerCase();

    // English PTP keywords
    const ptpKeywords = [
      'will pay', 'i will pay', 'promise to pay', 'payment on', 'paying on',
      'pay by', 'pay before', 'i agree', 'agreed', 'sending payment',
      'transferring', 'will transfer',
    ];

    // Hindi PTP keywords
    const ptpKeywordsHindi = [
      'bharna', 'bhar dunga', 'de dunga', 'payment kar', 'kar dunga',
      'haan', 'theek hai', 'ok kar dunga', 'kal bhejta',
    ];

    const allKeywords = [...ptpKeywords, ...ptpKeywordsHindi];
    const hasPtpIntent = allKeywords.some(k => lower.includes(k));

    if (hasPtpIntent) {
      normalized.ptpDetected = true;

      // Try to extract date from text
      const datePatterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,        // 20/04/2026 or 20-04-2026
        /(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
        /tomorrow/i, /kal/i, /parso/i,
      ];

      for (const pattern of datePatterns) {
        const match = lower.match(pattern);
        if (match) {
          if (pattern.source.includes('tomorrow') || pattern.source.includes('kal')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            normalized.ptpDate = tomorrow.toISOString().split('T')[0];
          } else if (pattern.source.includes('parso')) {
            const dayAfter = new Date();
            dayAfter.setDate(dayAfter.getDate() + 2);
            normalized.ptpDate = dayAfter.toISOString().split('T')[0];
          } else {
            // Try to parse the matched date
            try {
              const parsed = new Date(match[0]);
              if (!isNaN(parsed.getTime())) {
                normalized.ptpDate = parsed.toISOString().split('T')[0];
              }
            } catch { /* skip */ }
          }
          break;
        }
      }

      // Try to extract amount
      const amountMatch = lower.match(/(?:₹|rs\.?|inr)\s*(\d[\d,]*)/);
      if (amountMatch) {
        normalized.ptpAmount = Number(amountMatch[1].replace(/,/g, ''));
      }
    }
  }

  /**
   * Safely extracts a nested field from an object using dot notation.
   */
  private extractField(obj: any, path?: string): any {
    if (!path || !obj) return undefined;
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }
}
