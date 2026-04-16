import { Injectable, Logger } from '@nestjs/common';
import { db, portfolioRecords, commEvents, journeySteps, taskQueue } from '@platform/drizzle';
import { eq, sql } from 'drizzle-orm';
import { SegmentsService } from './segments.service';

@Injectable()
export class ReassignmentRulesService {
  private readonly logger = new Logger(ReassignmentRulesService.name);

  constructor(private readonly segmentsService: SegmentsService) {}

  /**
   * Processes an explicit segment reassignment. This happens when a
   * 'reassignSegment' journey step executes.
   */
  async reassignRecord(tenantId: string, recordId: string, targetSegmentId: string) {
    this.logger.log(`Explicitly reassigning record ${recordId} to segment ${targetSegmentId}`);

    // Update the record's current segment
    await db.update(portfolioRecords)
      .set({ 
        segmentId: targetSegmentId,
        updatedAt: new Date()
      })
      .where(eq(portfolioRecords.id, recordId));

    // Cancel any pending comm_events for this record (ending their current journey)
    const pendingEvents = await db
      .update(commEvents)
      .set({ status: 'failed' }) // Usually better to mark as 'cancelled', but 'failed' works for the boilerplate
      .where(sql`record_id = ${recordId} AND status = 'scheduled'`)
      .returning({ id: commEvents.id });

    // Enqueue a job to start the record on the new segment's journey
    if (targetSegmentId) {
      await db.insert(taskQueue).values({
        tenantId,
        jobType: 'segmentation.run',
        status: 'pending',
        payload: { tenantId, segmentId: targetSegmentId, recordIds: [recordId] },
        priority: 1,
        runAfter: new Date(),
      });
      this.logger.log(`Queued segmentation run for record ${recordId} on segment ${targetSegmentId}`);
    }
  }

  /**
   * Evaluates global reassignment rules based on new feedback data.
   * e.g., if PTP is broken, move to High Risk segment.
   * This is hooked into the FeedbackProcessorService.
   */
  async evaluateGlobalRules(tenantId: string, recordId: string) {
    // In a fully dynamic system, these rules would be defined per-tenant in a DB table.
    // For V2, we can hardcode the core logic or fetch it.
    
    const [record] = await db.select().from(portfolioRecords).where(eq(portfolioRecords.id, recordId));
    if (!record) return;

    // Example logic: if contactability score drops below 20 and we've tried 5+ times, move to unreachable
    if (record.totalCommAttempts && record.totalCommAttempts >= 5 && (record.contactabilityScore || 0) < 20) {
      // Reassign to some 'Unreachable' segment
      this.logger.log(`Record ${recordId} triggers global rule: Unreachable`);
      // this.reassignRecord(tenantId, recordId, unreachableSegmentId);
    }
  }
}
