import { Injectable, Logger } from '@nestjs/common';
import * as Papa from 'papaparse';
import { eq, and } from 'drizzle-orm';
import {
  db, portfolioRecords, commEvents, deliveryLogs,
  interactionEvents, conversationTranscripts, callRecordings,
} from '@platform/drizzle';
import { randomUUID } from 'crypto';

/**
 * IVR Call Feedback Sync Service
 * 
 * Parses IVR call CSV data (from providers like DinoDial) and writes to:
 * - comm_events (channel: ivr)
 * - delivery_logs (status mapping)
 * - interaction_events (outcome/sentiment/stage in details JSONB)
 * - conversation_transcripts (AI call summary)
 * - call_recordings (lens_url → s3AudioUrl)
 * - portfolio_records (PTP, contactability, last contacted updates)
 */
@Injectable()
export class IvrSyncsService {
  private readonly logger = new Logger(IvrSyncsService.name);

  /**
   * Map IVR outcome to our interactionType enum.
   */
  private mapOutcomeToInteractionType(outcome: string): string {
    const mapping: Record<string, string> = {
      'payment_plan_agreed': 'ptp',
      'callback_scheduled': 'callback_request',
      'denies_loan': 'dispute',
      'claim_already_paid': 'dispute',
      'escalated_to_senior': 'escalation',
      'wrong_person': 'wrong_contact',
      'customer_busy': 'no_contact',
      'no_response': 'no_contact',
    };
    return mapping[outcome] || 'ivr_call';
  }

  /**
   * Map IVR commitment type to ptpStatus.
   */
  private mapCommitmentType(commitmentType: string): string | null {
    if (!commitmentType || commitmentType === 'none') return null;
    if (commitmentType === 'full') return 'confirmed';
    return 'pending_review';
  }

  /**
   * Calculate a contactability score adjustment based on call status.
   */
  private getContactabilityDelta(status: string): number {
    switch (status) {
      case 'answered':
      case 'disposition_marked':
        return 15;
      case 'failed':
        return -5;
      case 'dnd':
        return -20;
      default:
        return 0;
    }
  }

  async uploadAndSync(fileBuffer: Buffer, tenantId: string, uploadedBy: string) {
    this.logger.log(`[IVR Sync] Started processing for tenant ${tenantId}`);

    const csvData = fileBuffer.toString('utf-8');
    let processed = 0;
    let skipped = 0;
    let errors = 0;

    return new Promise<{ processed: number; skipped: number; errors: number }>((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const rows = results.data as Record<string, string>[];
            this.logger.log(`[IVR Sync] Parsed ${rows.length} rows from CSV`);

            for (const [index, row] of rows.entries()) {
              try {
                // ── 1. Match to portfolio record ──
                const customerId = row['customer_id'] || row['customerId'];
                let phone = row['phone_number'] || row['phoneNumber'] || row['mobile'];
                
                if (!customerId && !phone) {
                  this.logger.warn(`[IVR Sync] Row ${index + 1}: Skipped — no customer_id or phone`);
                  skipped++;
                  continue;
                }

                // Strip +91 prefix from phone
                if (phone) {
                  phone = phone.replace(/^\+91/, '').replace(/^\+/, '').trim();
                }

                let filter;
                if (customerId) {
                  filter = and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.userId, customerId));
                } else {
                  filter = and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.mobile, phone!));
                }

                const [record] = await db.select().from(portfolioRecords).where(filter!).limit(1);
                if (!record) {
                  this.logger.warn(`[IVR Sync] Row ${index + 1}: No portfolio record for ${customerId || phone}`);
                  skipped++;
                  continue;
                }

                // ── Extract fields ──
                const status = (row['status'] || '').toLowerCase().trim();
                const calledAt = row['called_at'] || row['calledAt'];
                const summary = row['summary'] || '';
                const lensUrl = row['lens_url'] || row['lensUrl'] || '';
                const outcome = row['outcome'] || '';
                const sentiment = row['sentiment'] || '';
                const stageReached = row['stageReached'] || row['stage_reached'] || '';
                const commitmentAmount = row['commitmentAmount'] || row['commitment_amount'] || '';
                const commitmentDate = row['commitmentDate'] || row['commitment_date'] || '';
                const commitmentType = row['commitmentType'] || row['commitment_type'] || '';
                const attempt = row['attempt'] || '';

                // ── 2. Create comm_event ──
                const idempotencyKey = `ivr_${tenantId}_${record.id}_${calledAt || Date.now()}_${index}`;

                const [commEvent] = await db.insert(commEvents).values({
                  tenantId,
                  recordId: record.id,
                  channel: 'ivr',
                  status: status === 'disposition_marked' || status === 'answered' ? 'delivered' : 'failed',
                  sentAt: calledAt ? new Date(calledAt) : new Date(),
                  idempotencyKey,
                }).returning();

                // ── 3. Create delivery_log ──
                await db.insert(deliveryLogs).values({
                  eventId: commEvent.id,
                  tenantId,
                  providerName: 'dinodial',
                  deliveryStatus: status,
                  deliveredAt: (status === 'answered' || status === 'disposition_marked') && calledAt
                    ? new Date(calledAt)
                    : undefined,
                  callbackPayload: row, // Store the full CSV row as raw data
                });

                // ── 4. Create interaction_event (if meaningful data exists) ──
                let interactionId: string | null = null;

                if (status === 'answered' || status === 'disposition_marked' || outcome) {
                  const interactionType = this.mapOutcomeToInteractionType(outcome);

                  const [interaction] = await db.insert(interactionEvents).values({
                    tenantId,
                    recordId: record.id,
                    commEventId: commEvent.id,
                    interactionType,
                    channel: 'ivr',
                    details: {
                      outcome: outcome || null,
                      sentiment: sentiment || null,
                      stageReached: stageReached || null,
                      callStatus: status,
                      attempt: attempt ? parseInt(attempt) : null,
                      provider: 'dinodial',
                    },
                  }).returning();

                  interactionId = interaction.id;
                }

                // ── 5. Create conversation_transcript (if summary exists) ──
                let transcriptId: string | null = null;

                if (summary && summary.trim().length > 5 && interactionId) {
                  const [transcript] = await db.insert(conversationTranscripts).values({
                    interactionId,
                    tenantId,
                    recordId: record.id,
                    transcriptText: summary.trim(),
                    rawJson: { source: 'ivr_ai_summary', calledAt, outcome, sentiment },
                  }).returning();
                  transcriptId = transcript.id;
                }

                // ── 6. Create call_recording (if lens_url exists) ──
                if (lensUrl && lensUrl.startsWith('http')) {
                  await db.insert(callRecordings).values({
                    interactionId: interactionId || undefined,
                    tenantId,
                    recordId: record.id,
                    s3AudioUrl: lensUrl,
                    transcriptId: transcriptId || undefined,
                  });
                }

                // ── 7. Update portfolio_records summary fields ──
                const updateData: any = {
                  updatedAt: new Date(),
                  lastContactedAt: calledAt ? new Date(calledAt) : new Date(),
                  lastContactedChannel: 'ivr',
                };

                // Update comm counters
                const currentAttempts = Number(record.totalCommAttempts || 0);
                updateData.totalCommAttempts = currentAttempts + 1;

                if (status === 'answered' || status === 'disposition_marked') {
                  updateData.totalCommDelivered = Number(record.totalCommDelivered || 0) + 1;
                  updateData.lastDeliveryStatus = 'delivered';
                  updateData.lastInteractionType = this.mapOutcomeToInteractionType(outcome);
                } else {
                  updateData.lastDeliveryStatus = status; // 'failed' or 'dnd'
                }

                // Contactability score adjustment
                const currentScore = Number(record.contactabilityScore || 50);
                const delta = this.getContactabilityDelta(status);
                updateData.contactabilityScore = Math.max(0, Math.min(100, currentScore + delta));

                // PTP updates from commitment data
                const ptpStatus = this.mapCommitmentType(commitmentType);
                if (ptpStatus) {
                  updateData.ptpStatus = ptpStatus;
                  if (commitmentDate) updateData.ptpDate = commitmentDate;
                  if (commitmentAmount && !isNaN(Number(commitmentAmount))) {
                    updateData.ptpAmount = commitmentAmount;
                  }
                }

                await db.update(portfolioRecords).set(updateData).where(eq(portfolioRecords.id, record.id));

                processed++;
                if ((index + 1) % 100 === 0) {
                  this.logger.log(`[IVR Sync] Progress: ${index + 1}/${rows.length} (${processed} processed, ${skipped} skipped)`);
                }
              } catch (rowError: any) {
                this.logger.error(`[IVR Sync] Row ${index + 1}: ${rowError.message}`);
                errors++;
              }
            }

            this.logger.log(`[IVR Sync] Complete: ${processed} processed, ${skipped} skipped, ${errors} errors`);
            resolve({ processed, skipped, errors });
          } catch (err: any) {
            this.logger.error(`[IVR Sync] Fatal error: ${err.message}`);
            reject(err);
          }
        },
        error: (error: any) => {
          this.logger.error(`[IVR Sync] CSV parse error: ${error.message}`);
          reject(error);
        },
      });
    });
  }
}
