import { Injectable, Logger } from '@nestjs/common';
import { db, journeys, journeySteps, commEvents, portfolioRecords } from '@platform/drizzle';
import { eq, and, asc } from 'drizzle-orm';
import { ReassignmentRulesService } from '../segments/reassignment-rules.service';
@Injectable()
export class JourneyProgressionService {
  private readonly logger = new Logger(JourneyProgressionService.name);

  constructor(private readonly reassignmentRules: ReassignmentRulesService) {}

  /**
   * Admits a record to a journey.
   * Prevents re-entry if an active event already exists for this record in this journey.
   */
  async admitToJourney(tenantId: string, recordId: string, segmentId: string) {
    // 1. Find the active journey for this segment
    const [journey] = await db
      .select()
      .from(journeys)
      .where(and(
        eq(journeys.tenantId, tenantId),
        eq(journeys.segmentId, segmentId),
        eq(journeys.isActive, true)
      ))
      .limit(1);

    if (!journey) return;

    // 2. Check for active (scheduled or processing) events for this record in this journey
    // We check if any comm_event exists for this record linked to ANY step of this journey
    const activeEvents = await db
      .select({ id: commEvents.id })
      .from(commEvents)
      .innerJoin(journeySteps, eq(commEvents.journeyStepId, journeySteps.id))
      .where(and(
        eq(commEvents.recordId, recordId),
        eq(journeySteps.journeyId, journey.id),
        eq(commEvents.status, 'scheduled')
      ))
      .limit(1);

    if (activeEvents.length > 0) {
      this.logger.debug(`Record ${recordId} already in journey ${journey.id}, skipping admission.`);
      return;
    }

    // 3. Find the first step (stepOrder = 1)
    const [firstStep] = await db
      .select()
      .from(journeySteps)
      .where(and(eq(journeySteps.journeyId, journey.id), eq(journeySteps.stepOrder, 1)))
      .limit(1);

    if (!firstStep) return;

    // 4. Create the initial event
    await this.scheduleStep(tenantId, recordId, segmentId, firstStep);
    this.logger.log(`Admitted record ${recordId} to journey ${journey.id} (Step 1)`);
  }

  /**
   * Schedules a comm_event for a specific journey step.
   */
  async scheduleStep(tenantId: string, recordId: string, segmentId: string, step: any) {
    const scheduledAt = new Date();
    if (step.delayHours) {
      scheduledAt.setHours(scheduledAt.getHours() + step.delayHours);
    }

    // Determine target status based on actionType
    // 'wait' steps are also comm_events but with 'wait' status? 
    // Actually, let's keep it simple: everything that is 'scheduled' will be picked up by worker.
    
    await db.insert(commEvents).values({
      tenantId,
      recordId,
      segmentId,
      journeyStepId: step.id,
      channel: step.channel || 'system',
      status: 'scheduled',
      scheduledAt: scheduledAt,
      idempotencyKey: `evt_${recordId}_${step.id}_${scheduledAt.getTime()}`,
    });
  }

  /**
   * Advances a record to the next step in the journey.
   */
  async moveToNextStep(tenantId: string, recordId: string, currentStepId: string) {
    // 1. Find current step
    const [currentStep] = await db
      .select()
      .from(journeySteps)
      .where(eq(journeySteps.id, currentStepId))
      .limit(1);

    if (!currentStep) return;

    let nextStepId = (currentStep.conditionsJsonb as any)?.nextStepId;
    
    // 2. Handle Branching for Condition Checks
    if (currentStep.actionType === 'condition_check') {
        const [record] = await db.select().from(portfolioRecords).where(eq(portfolioRecords.id, recordId)).limit(1);
        const conditionMet = record && this.evaluateStepCondition(currentStep.conditionsJsonb, record);
        
        if (conditionMet) {
            nextStepId = (currentStep.conditionsJsonb as any)?.nextStepIdYes;
        } else {
            nextStepId = (currentStep.conditionsJsonb as any)?.nextStepIdNo;
        }

        if (!nextStepId) {
            this.logger.log(`Record ${recordId} reached end of branch at Step ${currentStep.stepOrder}`);
            return;
        }
    }

    // 3. Find next step
    let nextStep: any;
    if (nextStepId) {
        [nextStep] = await db
          .select()
          .from(journeySteps)
          .where(eq(journeySteps.id, nextStepId))
          .limit(1);
    } else {
        // Fallback to sequential order
        [nextStep] = await db
          .select()
          .from(journeySteps)
          .where(and(
            eq(journeySteps.journeyId, currentStep.journeyId),
            eq(journeySteps.stepOrder, currentStep.stepOrder + 1)
          ))
          .limit(1);
    }

    if (!nextStep) {
      this.logger.log(`Record ${recordId} completed journey ${currentStep.journeyId}`);
      return;
    }

    // 4. Handle special step types (recursion if needed)
    if (nextStep.actionType === 'reassign_segment') {
        const targetId = (nextStep.conditionsJsonb as any)?.targetSegmentId || (nextStep as any).targetSegmentId;
        if (targetId) {
            await this.reassignmentRules.reassignRecord(tenantId, recordId, targetId);
            return;
        }
    }

    if (nextStep.actionType === 'condition_check') {
        // Immediately evaluate next step if it's a condition check
        return this.moveToNextStep(tenantId, recordId, nextStep.id);
    }

    // 5. Schedule the next step
    const [journey] = await db.select({ segmentId: journeys.segmentId }).from(journeys).where(eq(journeys.id, currentStep.journeyId)).limit(1);
    await this.scheduleStep(tenantId, recordId, journey.segmentId, nextStep);
  }

  /**
   * Enhanced condition evaluator supporting:
   * 1. Core columns (name, mobile, outstanding, currentDpd, loanNumber, emiAmount, dueDate, cibilScore, etc.)
   * 2. Feedback summary columns (lastDeliveryStatus, contactabilityScore, ptpStatus, totalCommAttempts, etc.)
   * 3. Dynamic fields from JSONB (field1, field2, ... fieldN)
   * 4. Domain-specific operators (has_ptp, channel_viable, due_date_within, salary_date_is)
   */
  private evaluateStepCondition(conditions: any, record: any): boolean {
    if (!conditions || !conditions.rules) return true;
    const { operator, rules } = conditions;
    
    const results = rules.map((rule: any) => {
        // Resolve field value from record — check all layers
        const val = this.resolveFieldValue(record, rule.field);

        switch (rule.operator) {
            // Standard comparison operators
            case '===': case '==': return val == rule.value;
            case '!==': case '!=': return val != rule.value;
            case '>': return Number(val) > Number(rule.value);
            case '<': return Number(val) < Number(rule.value);
            case '>=': return Number(val) >= Number(rule.value);
            case '<=': return Number(val) <= Number(rule.value);

            // String operators
            case 'contains': return String(val || '').toLowerCase().includes(String(rule.value).toLowerCase());
            case 'not_contains': return !String(val || '').toLowerCase().includes(String(rule.value).toLowerCase());
            case 'starts_with': return String(val || '').toLowerCase().startsWith(String(rule.value).toLowerCase());
            case 'is_empty': return !val || val === '' || val === null || val === undefined;
            case 'is_not_empty': return val !== null && val !== undefined && val !== '';

            // Domain-specific operators
            case 'has_ptp': {
              // Check if record has an active PTP date in the future
              const ptpDate = record.ptpDate;
              const ptpStatus = record.ptpStatus;
              if (!ptpDate) return false;
              const isPtpActive = new Date(ptpDate) >= new Date() && (ptpStatus === 'confirmed' || ptpStatus === 'pending_review');
              return rule.value === 'true' ? isPtpActive : !isPtpActive;
            }
            case 'channel_viable': {
              // Check if a specific channel has delivered successfully before
              const lastChannel = record.lastContactedChannel;
              const lastStatus = record.lastDeliveryStatus;
              return lastChannel === rule.value && ['delivered', 'read', 'replied'].includes(lastStatus);
            }
            case 'due_date_within': {
              // Check if due date is within N days from now
              if (!record.dueDate) return false;
              const dueDate = new Date(record.dueDate);
              const now = new Date();
              const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= Number(rule.value);
            }
            case 'salary_date_is': {
              // Check if today matches the salary day of month
              const today = new Date().getDate();
              return today === Number(record.salaryDate || 0);
            }
            case 'no_response_since': {
              // No interaction within N hours of last communication
              if (!record.lastContactedAt) return true; // Never contacted = no response
              const lastContact = new Date(record.lastContactedAt);
              const hoursAgo = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60);
              return hoursAgo >= Number(rule.value) && !record.lastInteractionAt;
            }

            default: return false;
        }
    });

    if (operator === 'OR') return results.some((r: boolean) => r);
    return results.every((r: boolean) => r);
  }

  /**
   * Resolves a field value by checking: core columns → feedback columns → dynamicFields JSONB
   */
  private resolveFieldValue(record: any, field: string): any {
    // Direct field access (covers all core + feedback columns)
    if (record[field] !== undefined) return record[field];

    // CamelCase access for snake_case fields from DB
    const camelField = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (record[camelField] !== undefined) return record[camelField];

    // Dynamic fields JSONB
    if (record.dynamicFields) {
      const df = record.dynamicFields as Record<string, any>;
      if (df[field] !== undefined) return df[field];
      if (df[camelField] !== undefined) return df[camelField];
    }

    return undefined;
  }
}
