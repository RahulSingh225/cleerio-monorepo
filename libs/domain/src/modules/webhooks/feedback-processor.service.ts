import { Injectable, Logger } from '@nestjs/common';
import { db, deliveryLogs, commEvents, portfolioRecords, interactionEvents, taskQueue } from '@platform/drizzle';
import { eq, and, sql } from 'drizzle-orm';
import { NormalizedCallback } from './callback-normalizer.service';
import { ReassignmentRulesService } from '../segments/reassignment-rules.service';

@Injectable()
export class FeedbackProcessorService {
  private readonly logger = new Logger(FeedbackProcessorService.name);

  constructor(private readonly reassignmentRules: ReassignmentRulesService) {}

  /**
   * Main entry point: processes a normalized callback through the full feedback pipeline.
   */
  async process(callback: NormalizedCallback) {
    this.logger.log(`Processing ${callback.channel} callback: ${callback.deliveryStatus} (msgId: ${callback.providerMsgId})`);

    // 1. Find and update the delivery log
    const deliveryLog = await this.updateDeliveryLog(callback);
    if (!deliveryLog) {
      this.logger.warn(`No delivery log found for providerMsgId: ${callback.providerMsgId}`);
      return;
    }

    // 2. Update the comm_event status
    await this.updateCommEvent(deliveryLog.eventId, callback);

    // 3. Get the record ID from the comm event
    const [event] = await db
      .select({ recordId: commEvents.recordId })
      .from(commEvents)
      .where(eq(commEvents.id, deliveryLog.eventId))
      .limit(1);

    if (!event) return;

    // 4. Update portfolio record feedback summary
    await this.updateRecordFeedback(event.recordId, callback);

    // 5. Create interaction events for meaningful interactions
    await this.createInteractionEvents(callback.tenantId, event.recordId, deliveryLog.eventId, callback);

    // 6. Handle PTP detection (flagged for manual review)
    if (callback.ptpDetected) {
      await this.handlePtpDetection(event.recordId, callback);
    }

    // 7. Check if any journey is waiting for this feedback
    await this.checkWaitingJourneys(callback.tenantId, event.recordId, deliveryLog.eventId);

    // 8. Evaluate global reassignment rules based on the new feedback state
    await this.reassignmentRules.evaluateGlobalRules(callback.tenantId, event.recordId);

    this.logger.log(`Feedback pipeline complete for msgId: ${callback.providerMsgId}`);
  }

  /**
   * Step 1: Find and update delivery_logs by providerMsgId.
   */
  private async updateDeliveryLog(callback: NormalizedCallback) {
    const [log] = await db
      .select()
      .from(deliveryLogs)
      .where(eq(deliveryLogs.providerMsgId, callback.providerMsgId))
      .limit(1);

    if (!log) return null;

    const updates: any = {
      deliveryStatus: callback.deliveryStatus,
      callbackPayload: callback.rawPayload,
    };

    if (callback.deliveredAt) updates.deliveredAt = callback.deliveredAt;
    if (callback.readAt) updates.readAt = callback.readAt;
    if (callback.repliedAt) updates.repliedAt = callback.repliedAt;
    if (callback.replyContent) updates.replyContent = callback.replyContent;
    if (callback.failureReason) updates.failureReason = callback.failureReason;
    if (callback.errorCode) updates.errorCode = callback.errorCode;
    if (callback.linkClicked) {
      updates.linkClicked = true;
      updates.linkClickedAt = callback.linkClickedAt || new Date();
    }

    await db.update(deliveryLogs).set(updates).where(eq(deliveryLogs.id, log.id));
    return log;
  }

  /**
   * Step 2: Update comm_events status to match delivery status.
   */
  private async updateCommEvent(eventId: string, callback: NormalizedCallback) {
    const statusMap: Record<string, string> = {
      sent: 'sent',
      delivered: 'delivered',
      read: 'delivered',      // 'read' is a sub-state of delivered
      replied: 'delivered',   // 'replied' implies delivered
      failed: 'failed',
    };

    const newStatus = statusMap[callback.deliveryStatus] || 'sent';
    await db.update(commEvents).set({ status: newStatus }).where(eq(commEvents.id, eventId));
  }

  /**
   * Step 3: Roll up feedback into portfolio_records summary columns.
   * Contactability score is recalculated on every callback.
   */
  private async updateRecordFeedback(recordId: string, callback: NormalizedCallback) {
    const updates: any = {
      lastContactedAt: new Date(),
      lastContactedChannel: callback.channel,
      lastDeliveryStatus: callback.deliveryStatus,
      updatedAt: new Date(),
    };

    // Increment counters based on status
    const incrementUpdates: string[] = [];

    if (['sent', 'delivered', 'read', 'replied'].includes(callback.deliveryStatus)) {
      incrementUpdates.push('total_comm_attempts = COALESCE(total_comm_attempts, 0) + 1');
    }
    if (['delivered', 'read', 'replied'].includes(callback.deliveryStatus)) {
      incrementUpdates.push('total_comm_delivered = COALESCE(total_comm_delivered, 0) + 1');
    }
    if (['read', 'replied'].includes(callback.deliveryStatus)) {
      incrementUpdates.push('total_comm_read = COALESCE(total_comm_read, 0) + 1');
    }
    if (callback.deliveryStatus === 'replied') {
      incrementUpdates.push('total_comm_replied = COALESCE(total_comm_replied, 0) + 1');
      updates.lastInteractionType = 'reply';
      updates.lastInteractionAt = new Date();
    }

    if (callback.linkClicked) {
      updates.lastInteractionType = 'link_click';
      updates.lastInteractionAt = callback.linkClickedAt || new Date();
    }

    // Apply basic updates
    await db.update(portfolioRecords).set(updates).where(eq(portfolioRecords.id, recordId));

    // Apply counter increments via raw SQL for atomicity
    if (incrementUpdates.length > 0) {
      await db.execute(sql.raw(`
        UPDATE portfolio_records SET ${incrementUpdates.join(', ')} WHERE id = '${recordId}'
      `));
    }

    // Recalculate contactability score
    await this.recalculateContactabilityScore(recordId);
  }

  /**
   * Contactability Score Formula:
   * score = (delivered / attempts * 40) + (read / delivered * 30) + (replied / read * 30)
   */
  private async recalculateContactabilityScore(recordId: string) {
    const [record] = await db
      .select({
        attempts: portfolioRecords.totalCommAttempts,
        delivered: portfolioRecords.totalCommDelivered,
        read: portfolioRecords.totalCommRead,
        replied: portfolioRecords.totalCommReplied,
      })
      .from(portfolioRecords)
      .where(eq(portfolioRecords.id, recordId))
      .limit(1);

    if (!record) return;

    const attempts = record.attempts || 0;
    const delivered = record.delivered || 0;
    const read = record.read || 0;
    const replied = record.replied || 0;

    let score = 0;
    if (attempts > 0) score += (delivered / attempts) * 40;
    if (delivered > 0) score += (read / delivered) * 30;
    if (read > 0) score += (replied / read) * 30;

    score = Math.round(Math.min(100, Math.max(0, score)));

    // Determine preferred channel based on best delivery rate
    // For now, just use the last successful channel
    await db.update(portfolioRecords).set({
      contactabilityScore: score,
    }).where(eq(portfolioRecords.id, recordId));
  }

  /**
   * Step 4: Create interaction_events for meaningful interactions.
   */
  private async createInteractionEvents(
    tenantId: string,
    recordId: string,
    eventId: string,
    callback: NormalizedCallback,
  ) {
    // Only create interaction events for significant actions
    const significantStatuses = ['replied', 'failed'];
    if (!significantStatuses.includes(callback.deliveryStatus) && !callback.linkClicked && !callback.ptpDetected) {
      return;
    }

    let interactionType = 'delivery_status';
    if (callback.deliveryStatus === 'replied') interactionType = 'reply';
    if (callback.linkClicked) interactionType = 'link_click';
    if (callback.ptpDetected) interactionType = 'ptp';
    if (callback.deliveryStatus === 'failed' && callback.failureReason === 'invalid_number') {
      interactionType = 'invalid_contact';
    }

    await db.insert(interactionEvents).values({
      tenantId,
      recordId,
      channel: callback.channel,
      interactionType: interactionType,
      details: {
        deliveryStatus: callback.deliveryStatus,
        failureReason: callback.failureReason,
        replyContent: callback.replyContent,
        linkClicked: callback.linkClicked,
        ptpDetected: callback.ptpDetected,
        ptpDate: callback.ptpDate,
        ptpAmount: callback.ptpAmount,
        providerMsgId: callback.providerMsgId,
      },
    });
  }

  /**
   * Step 5: Handle PTP detection — flagged for manual review.
   */
  private async handlePtpDetection(recordId: string, callback: NormalizedCallback) {
    this.logger.log(`PTP detected for record ${recordId}: date=${callback.ptpDate}, amount=${callback.ptpAmount}`);

    const updates: any = {
      ptpStatus: 'pending_review',  // Agent must confirm
      lastInteractionType: 'ptp',
      lastInteractionAt: new Date(),
    };

    if (callback.ptpDate) updates.ptpDate = callback.ptpDate;
    if (callback.ptpAmount) updates.ptpAmount = String(callback.ptpAmount);

    await db.update(portfolioRecords).set(updates).where(eq(portfolioRecords.id, recordId));
  }

  /**
   * Step 6: Check if any journey step is waiting for feedback and advance it.
   */
  private async checkWaitingJourneys(tenantId: string, recordId: string, eventId: string) {
    // Find comm_events linked to this record that are in 'wait_for_feedback' equivalent state
    // In our model, a 'wait_for_feedback' step creates a comm_event with status 'scheduled' and channel 'system'
    // When feedback arrives for a previous step, we check if the next step is a wait_for_feedback and advance
    // This is handled by the progression service in the worker, not here
    // We just queue a task to check
    await db.insert(taskQueue).values({
      tenantId,
      jobType: 'feedback.process',
      status: 'pending',
      payload: { tenantId, recordId, eventId, action: 'check_journey_progression' },
      priority: 2,
      runAfter: new Date(),
    });
  }
}
