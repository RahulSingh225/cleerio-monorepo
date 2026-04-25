import { Controller, Get, Query, UseGuards, Param, Logger } from '@nestjs/common';
import { PortfolioRecordsService } from './portfolio-records.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard, TenantContext } from '@platform/tenant';
import { eq, and, count, desc } from 'drizzle-orm';
import { db, portfolioRecords, commEvents, deliveryLogs, interactionEvents, repaymentRecords } from '@platform/drizzle';

@Controller('portfolio-records')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PortfolioRecordsController {
  private readonly logger = new Logger(PortfolioRecordsController.name);
  constructor(private readonly recordsService: PortfolioRecordsService) {}

  /**
   * Introspect actual portfolio records to discover ALL available field keys.
   * This is the single source of truth for the segment rule builder.
   * Returns core columns + every key found in dynamicFields JSONB across sampled records.
   */
  @Get('fields')
  @ApiResponseConfig({
    message: 'Available fields retrieved',
    apiCode: 'FIELDS_RETRIEVED',
  })
  async getAvailableFields() {
    const tenantId = TenantContext.tenantId;
    // Sample up to 100 records to discover all dynamic field keys
    const sample = await db
      .select({
        dynamicFields: portfolioRecords.dynamicFields,
        product: portfolioRecords.product,
        currentDpd: portfolioRecords.currentDpd,
        outstanding: portfolioRecords.outstanding,
      })
      .from(portfolioRecords)
      .where(eq(portfolioRecords.tenantId, tenantId!))
      .limit(100)
      .execute();

    // Core fields always available (from portfolio_records columns)
    const coreFields = [
      // Original core
      { key: 'current_dpd', label: 'Current DPD', dataType: 'number', isCore: true },
      { key: 'outstanding', label: 'Outstanding Amount', dataType: 'number', isCore: true },
      { key: 'total_repaid', label: 'Total Repaid', dataType: 'number', isCore: true },
      { key: 'product', label: 'Product / Loan Type', dataType: 'string', isCore: true },
      { key: 'employer_name', label: 'Employer Name', dataType: 'string', isCore: true },
      { key: 'name', label: 'Borrower Name', dataType: 'string', isCore: true },
      { key: 'mobile', label: 'Mobile Number', dataType: 'string', isCore: true },
      { key: 'user_id', label: 'User ID', dataType: 'string', isCore: true },
      // Promoted core (Phase 5.0 — from stakeholder data requirements)
      { key: 'loan_number', label: 'Loan Number', dataType: 'string', isCore: true },
      { key: 'email', label: 'Email', dataType: 'string', isCore: true },
      { key: 'due_date', label: 'Due Date', dataType: 'date', isCore: true },
      { key: 'emi_amount', label: 'EMI Amount', dataType: 'number', isCore: true },
      { key: 'language', label: 'Language', dataType: 'string', isCore: true },
      { key: 'state', label: 'State', dataType: 'string', isCore: true },
      { key: 'city', label: 'City', dataType: 'string', isCore: true },
      { key: 'cibil_score', label: 'CIBIL Score', dataType: 'number', isCore: true },
      { key: 'salary_date', label: 'Salary Date', dataType: 'number', isCore: true },
      { key: 'enach_enabled', label: 'E-NACH Enabled', dataType: 'boolean', isCore: true },
      { key: 'loan_amount', label: 'Loan Amount', dataType: 'number', isCore: true },
      // Feedback summary (Phase 5.1)
      { key: 'last_delivery_status', label: 'Last Delivery Status', dataType: 'string', isCore: true },
      { key: 'last_contacted_channel', label: 'Last Contacted Channel', dataType: 'string', isCore: true },
      { key: 'last_interaction_type', label: 'Last Interaction Type', dataType: 'string', isCore: true },
      { key: 'contactability_score', label: 'Contactability Score', dataType: 'number', isCore: true },
      { key: 'total_comm_attempts', label: 'Total Comm Attempts', dataType: 'number', isCore: true },
      { key: 'total_comm_delivered', label: 'Total Comm Delivered', dataType: 'number', isCore: true },
      { key: 'total_comm_read', label: 'Total Comm Read', dataType: 'number', isCore: true },
      { key: 'total_comm_replied', label: 'Total Comm Replied', dataType: 'number', isCore: true },
      { key: 'ptp_status', label: 'PTP Status', dataType: 'string', isCore: true },
      { key: 'ptp_date', label: 'PTP Date', dataType: 'date', isCore: true },
      { key: 'risk_bucket', label: 'Risk Bucket', dataType: 'string', isCore: true },
      { key: 'preferred_channel', label: 'Preferred Channel', dataType: 'string', isCore: true },
    ];

    // Collect all unique dynamic field keys from sampled records
    const dynamicKeySet = new Set<string>();
    for (const rec of sample) {
      const df = rec.dynamicFields as Record<string, any> | null;
      if (df && typeof df === 'object') {
        for (const key of Object.keys(df)) {
          dynamicKeySet.add(key);
        }
      }
    }

    // Convert dynamic keys to field objects
    const coreKeySet = new Set(coreFields.map(f => f.key));
    const dynamicFields = Array.from(dynamicKeySet)
      .filter(k => !coreKeySet.has(k))
      .map(key => {
        // Try to infer data type from sample values
        let dataType = 'string';
        for (const rec of sample) {
          const df = rec.dynamicFields as Record<string, any> | null;
          const val = df?.[key];
          if (val !== undefined && val !== null && val !== '') {
            if (!isNaN(Number(val))) { dataType = 'number'; }
            break;
          }
        }
        return {
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          dataType,
          isCore: false,
        };
      });

    return { data: [...coreFields, ...dynamicFields] };
  }

  @Get('count')
  @ApiResponseConfig({
    message: 'Record count retrieved',
    apiCode: 'RECORD_COUNT',
  })
  async getCount() {
    const count = await this.recordsService.totalCount();
    return { data: { count } };
  }

  @Get('portfolio/:portfolioId')
  @ApiResponseConfig({
    message: 'Portfolio records retrieved successfully',
    apiCode: 'PORTFOLIO_RECORDS_RETRIEVED',
  })
  async findByPortfolio(
    @Param('portfolioId') portfolioId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // Basic pagination + scoping
    return this.recordsService.findMany({
      where: eq(portfolioRecords.portfolioId, portfolioId),
      limit: limit || 50,
      offset: offset || 0,
    });
  }

  @Get(':id')
  @ApiResponseConfig({
    message: 'Record retrieved successfully',
    apiCode: 'RECORD_RETRIEVED',
  })
  async findOne(@Param('id') id: string) {
    return this.recordsService.findFirst(eq(portfolioRecords.id, id));
  }

  /**
   * 360° Unified Timeline: Merges comm_events (with delivery_logs),
   * interaction_events, and repayment_records into a single chronological feed.
   */
  @Get(':id/timeline')
  @ApiResponseConfig({
    message: 'Record timeline retrieved',
    apiCode: 'RECORD_TIMELINE_RETRIEVED',
  })
  async getTimeline(@Param('id') id: string) {
    this.logger.log(`[Timeline] Fetching 360° timeline for record ${id}`);
    const timeline: any[] = [];

    // 1. Comm Events + Delivery Logs
    try {
      const events = await db
        .select()
        .from(commEvents)
        .where(eq(commEvents.recordId, id))
        .orderBy(desc(commEvents.createdAt))
        .execute();

      for (const event of events) {
        // Fetch delivery logs for this event
        const logs = await db
          .select()
          .from(deliveryLogs)
          .where(eq(deliveryLogs.eventId, event.id))
          .orderBy(desc(deliveryLogs.createdAt))
          .execute();

        const latestLog = logs[0];

        timeline.push({
          id: event.id,
          type: 'communication',
          category: 'comm',
          channel: event.channel,
          status: latestLog?.deliveryStatus || event.status,
          timestamp: event.sentAt || event.scheduledAt || event.createdAt,
          details: {
            resolvedBody: event.resolvedBody,
            resolvedFields: event.resolvedFields,
            scheduledAt: event.scheduledAt,
            sentAt: event.sentAt,
            deliveredAt: latestLog?.deliveredAt,
            readAt: latestLog?.readAt,
            repliedAt: latestLog?.repliedAt,
            replyContent: latestLog?.replyContent,
            linkClicked: latestLog?.linkClicked,
            linkClickedAt: latestLog?.linkClickedAt,
            errorCode: latestLog?.errorCode,
            errorMessage: latestLog?.errorMessage,
            failureReason: latestLog?.failureReason,
            providerName: latestLog?.providerName,
            providerMsgId: latestLog?.providerMsgId,
          },
        });
      }
      this.logger.log(`[Timeline] Found ${events.length} comm events for record ${id}`);
    } catch (err: any) {
      this.logger.warn(`[Timeline] Could not load comm events: ${err.message}`);
    }

    // 2. Interaction Events (PTP, replies, disputes, opt-outs, etc.)
    try {
      const interactions = await db
        .select()
        .from(interactionEvents)
        .where(eq(interactionEvents.recordId, id))
        .orderBy(desc(interactionEvents.createdAt))
        .execute();

      for (const interaction of interactions) {
        timeline.push({
          id: interaction.id,
          type: 'interaction',
          category: interaction.interactionType,
          channel: interaction.channel,
          status: null,
          timestamp: interaction.createdAt,
          details: interaction.details || {},
        });
      }
      this.logger.log(`[Timeline] Found ${interactions.length} interaction events for record ${id}`);
    } catch (err: any) {
      this.logger.warn(`[Timeline] Could not load interaction events: ${err.message}`);
    }

    // 3. Repayment Records
    try {
      const repayments = await db
        .select()
        .from(repaymentRecords)
        .where(eq(repaymentRecords.portfolioRecordId, id))
        .orderBy(desc(repaymentRecords.createdAt))
        .execute();

      for (const repayment of repayments) {
        timeline.push({
          id: repayment.id,
          type: 'repayment',
          category: 'payment',
          channel: null,
          status: 'completed',
          timestamp: repayment.createdAt || repayment.paymentDate,
          details: {
            amount: repayment.amount,
            paymentDate: repayment.paymentDate,
            paymentType: repayment.paymentType,
            reference: repayment.reference,
          },
        });
      }
      this.logger.log(`[Timeline] Found ${repayments.length} repayment records for record ${id}`);
    } catch (err: any) {
      this.logger.warn(`[Timeline] Could not load repayment records: ${err.message}`);
    }

    // Sort all events chronologically (newest first)
    timeline.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    this.logger.log(`[Timeline] Returning ${timeline.length} total events for record ${id}`);
    return { data: timeline };
  }
}


