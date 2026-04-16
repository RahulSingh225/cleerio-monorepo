import { Injectable, Logger } from '@nestjs/common';
import { db, portfolioRecords, commEvents } from '@platform/drizzle';
import { eq, sql } from 'drizzle-orm';
import * as crypto from 'crypto';

export interface PaymentLinkData {
  url: string;
  shortCode: string;
}

@Injectable()
export class PaymentLinksService {
  private readonly logger = new Logger(PaymentLinksService.name);
  private readonly BASE_DOMAIN = process.env.BASE_DOMAIN || 'https://link.cleerio.com';

  /**
   * Generates a tracked short link for a payment or interaction.
   * Format: https://{domain}/p/{shortCode}
   */
  async generateTrackedLink(tenantId: string, recordId: string, eventId: string, destinationUrl: string, linkType: 'payment' | 'half_emi' | 'foreclosure' | 'penalty_waiver'): Promise<PaymentLinkData> {
    // Generate a unique 8-character code
    const shortCode = crypto.randomBytes(4).toString('hex');
    
    // In a full implementation, we'd store this in a `payment_links` table
    // For this boilerplate, we'll embed the short code into the destination URL
    // or just return the constructed short link

    const trackedUrl = `${this.BASE_DOMAIN}/p/${shortCode}`;
    this.logger.debug(`Generated tracked ${linkType} link for record ${recordId}: ${trackedUrl}`);
    
    // Update the event with the generated shortcode
    await db.execute(sql`
      UPDATE comm_events 
      SET resolved_fields = jsonb_set(
        COALESCE(resolved_fields, '{}'::jsonb), 
        '{${sql.raw(linkType + '_link_code')}}', 
        '"${sql.raw(shortCode)}"'
      ) 
      WHERE id = '${eventId}'
    `);

    return {
      url: trackedUrl,
      shortCode,
    };
  }

  /**
   * Resolves a short code back to its event and destination URL.
   * This is called when the user visits the /p/:shortCode endpoint.
   */
  async resolveAndTrackClick(shortCode: string): Promise<string> {
    this.logger.log(`Payment link clicked: ${shortCode}`);
    
    // In a real implementation, we'd lookup the code in a dedicated table.
    // For now, return a placeholder gateway URL
    return 'https://gateway.cleerio.com/pay';
  }
}
