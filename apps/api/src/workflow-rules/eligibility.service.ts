import { Injectable } from '@nestjs/common';
import { db, optOutList, portfolioRecords, channelConfigs } from '@platform/drizzle';
import { eq, and } from 'drizzle-orm';
import { TenantContext } from '@platform/tenant';

@Injectable()
export class EligibilityService {
  constructor() {}

  async evaluateRecordEligibility(recordId: string, channel: string): Promise<{ eligible: boolean, reason?: string }> {
    const tenantId = TenantContext.tenantId;

    // 1. Check Opt-Out (DNC) for specific mobile
    const [record] = await db.select().from(portfolioRecords)
      .where(and(eq(portfolioRecords.id, recordId), eq(portfolioRecords.tenantId, tenantId!)))
      .limit(1);

    if (!record) return { eligible: false, reason: 'RECORD_NOT_FOUND' };
    if (record.isOptedOut) return { eligible: false, reason: 'OPTED_OUT_RECORD' };

    const [optOutConfig] = await db.select().from(optOutList)
      .where(and(eq(optOutList.mobile, record.mobile), eq(optOutList.tenantId, tenantId!)))
      .limit(1);
    
    // Globally opted out or opted out on specific channel
    if (optOutConfig && (!optOutConfig.channel || optOutConfig.channel === channel)) {
      return { eligible: false, reason: 'DNC_LIST' };
    }

    // 2. Check Channel Cap limit globally
    const [channelConfig] = await db.select().from(channelConfigs)
      .where(and(eq(channelConfigs.channel, channel), eq(channelConfigs.tenantId, tenantId!)))
      .limit(1);

    if (!channelConfig || !channelConfig.isEnabled) {
        return { eligible: false, reason: 'CHANNEL_DISABLED' };
    }

    // In a real flow, evaluate Redis counters against channelConfig.dailyCap

    return { eligible: true };
  }
}
