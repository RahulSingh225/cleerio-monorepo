import { Controller, Get, Query, UseGuards, Param, Logger } from '@nestjs/common';
import { PortfolioRecordsService } from './portfolio-records.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard, TenantContext } from '@platform/tenant';
import { eq, and, count, desc, isNotNull, isNull, gte, lte, like, or, sql, sum } from 'drizzle-orm';
import {
  db, portfolioRecords, commEvents, deliveryLogs, interactionEvents,
  repaymentRecords, conversationTranscripts, callRecordings, aiInsights,
} from '@platform/drizzle';

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
    const count = await this.recordsService.totalCount(eq(portfolioRecords.tenantId, TenantContext.tenantId!));
    return { data: { count } };
  }

  /**
   * Global search by mobile, userId, name, or loanNumber across all portfolios.
   */
  @Get('search')
  @ApiResponseConfig({
    message: 'Search results retrieved',
    apiCode: 'SEARCH_RESULTS',
  })
  async searchRecords(
    @Query('q') q: string,
    @Query('limit') limit?: number,
  ) {
    const tenantId = TenantContext.tenantId!;
    if (!q || q.trim().length < 2) {
      return { data: [], meta: { totalCount: 0 } };
    }
    const term = `%${q.trim()}%`;
    const whereClause = and(
      eq(portfolioRecords.tenantId, tenantId),
      or(
        like(portfolioRecords.mobile, term),
        like(portfolioRecords.userId, term),
        like(portfolioRecords.name, term),
        like(portfolioRecords.loanNumber, term),
        like(portfolioRecords.email, term),
      )!,
    );

    const [countResult] = await db.select({ value: count() }).from(portfolioRecords).where(whereClause);
    const data = await db.select().from(portfolioRecords)
      .where(whereClause)
      .orderBy(desc(portfolioRecords.createdAt))
      .limit(Number(limit) || 30)
      .execute();

    return { data, meta: { totalCount: Number(countResult?.value || 0) } };
  }

  @Get()
  @ApiResponseConfig({
    message: 'Records retrieved successfully',
    apiCode: 'RECORDS_RETRIEVED',
  })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('segmentId') segmentId?: string,
    @Query('isAssigned') isAssigned?: string,
    @Query('search') search?: string,
    @Query('dpdMin') dpdMin?: string,
    @Query('dpdMax') dpdMax?: string,
    @Query('product') product?: string,
    @Query('lastDeliveryStatus') lastDeliveryStatus?: string,
    @Query('riskBucket') riskBucket?: string,
    @Query('ptpStatus') ptpStatus?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: string,
    @Query('portfolioId') portfolioId?: string,
  ) {
    const filters: any[] = [eq(portfolioRecords.tenantId, TenantContext.tenantId!)];

    if (portfolioId) {
      filters.push(eq(portfolioRecords.portfolioId, portfolioId));
    }

    if (segmentId) {
      filters.push(eq(portfolioRecords.segmentId, segmentId));
    }

    if (isAssigned === 'true') {
      filters.push(isNotNull(portfolioRecords.segmentId));
    } else if (isAssigned === 'false') {
      filters.push(isNull(portfolioRecords.segmentId));
    }

    // Text search across name, mobile, userId, loanNumber
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      filters.push(
        or(
          like(portfolioRecords.name, term),
          like(portfolioRecords.mobile, term),
          like(portfolioRecords.userId, term),
          like(portfolioRecords.loanNumber, term),
        )!
      );
    }

    // DPD range
    if (dpdMin) filters.push(gte(portfolioRecords.currentDpd, Number(dpdMin)));
    if (dpdMax) filters.push(lte(portfolioRecords.currentDpd, Number(dpdMax)));

    // Product filter
    if (product) filters.push(eq(portfolioRecords.product, product));

    // Delivery status filter
    if (lastDeliveryStatus) filters.push(eq(portfolioRecords.lastDeliveryStatus, lastDeliveryStatus));

    // Risk bucket filter
    if (riskBucket) filters.push(eq(portfolioRecords.riskBucket, riskBucket));

    // PTP status filter
    if (ptpStatus) filters.push(eq(portfolioRecords.ptpStatus, ptpStatus));

    const whereClause = and(...filters);

    // Get total count for pagination
    const [countResult] = await db.select({ value: count() }).from(portfolioRecords).where(whereClause);
    const totalCount = Number(countResult?.value || 0);

    // Build ordered query
    let orderClause;
    if (sortBy === 'outstanding') orderClause = sortDir === 'asc' ? portfolioRecords.outstanding : desc(portfolioRecords.outstanding);
    else if (sortBy === 'currentDpd') orderClause = sortDir === 'asc' ? portfolioRecords.currentDpd : desc(portfolioRecords.currentDpd);
    else if (sortBy === 'name') orderClause = sortDir === 'asc' ? portfolioRecords.name : desc(portfolioRecords.name);
    else orderClause = desc(portfolioRecords.createdAt);

    const data = await db.select().from(portfolioRecords)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(Number(limit) || 20)
      .offset(Number(offset) || 0);

    return { data, meta: { totalCount } };
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

  /**
   * Cross-record lookup: find all records with the same mobile number.
   */
  @Get('by-mobile/:mobile')
  @ApiResponseConfig({
    message: 'Records by mobile retrieved',
    apiCode: 'RECORDS_BY_MOBILE',
  })
  async findByMobile(
    @Param('mobile') mobile: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const tenantId = TenantContext.tenantId!;
    const filters: any[] = [
      eq(portfolioRecords.tenantId, tenantId),
      eq(portfolioRecords.mobile, mobile),
    ];
    const data = await db.select().from(portfolioRecords)
      .where(and(...filters))
      .orderBy(desc(portfolioRecords.createdAt))
      .execute();

    // Optionally exclude the current record from results
    const filtered = excludeId ? data.filter(r => r.id !== excludeId) : data;
    return { data: filtered };
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
   * Pre-computed story summary: channel breakdown, delivery rates,
   * sentiment distribution, PTP history, repayment trend.
   */
  @Get(':id/story-summary')
  @ApiResponseConfig({
    message: 'Story summary retrieved',
    apiCode: 'STORY_SUMMARY_RETRIEVED',
  })
  async getStorySummary(@Param('id') id: string) {
    const tenantId = TenantContext.tenantId!;

    // Get the record to find mobile for cross-record merge
    const [record] = await db.select({ mobile: portfolioRecords.mobile })
      .from(portfolioRecords).where(eq(portfolioRecords.id, id)).execute();
    if (!record) return { data: null };

    // Find all record IDs for this borrower (same mobile)
    const allRecords = await db.select({ id: portfolioRecords.id })
      .from(portfolioRecords)
      .where(and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.mobile, record.mobile)))
      .execute();
    const recordIds = allRecords.map(r => r.id);

    // Channel breakdown from comm_events
    const channelBreakdown: Record<string, { sent: number; delivered: number; read: number; replied: number; failed: number }> = {};
    for (const rid of recordIds) {
      const events = await db.select().from(commEvents).where(eq(commEvents.recordId, rid)).execute();
      for (const evt of events) {
        const ch = evt.channel || 'unknown';
        if (!channelBreakdown[ch]) channelBreakdown[ch] = { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 };
        channelBreakdown[ch].sent++;

        const logs = await db.select().from(deliveryLogs).where(eq(deliveryLogs.eventId, evt.id)).execute();
        const latest = logs[0];
        if (latest) {
          const s = latest.deliveryStatus;
          if (s === 'delivered' || s === 'read' || s === 'replied') channelBreakdown[ch].delivered++;
          if (s === 'read' || s === 'replied') channelBreakdown[ch].read++;
          if (s === 'replied') channelBreakdown[ch].replied++;
          if (s === 'failed') channelBreakdown[ch].failed++;
        }
      }
    }

    // Total comms
    const totalSent = Object.values(channelBreakdown).reduce((s, c) => s + c.sent, 0);
    const totalDelivered = Object.values(channelBreakdown).reduce((s, c) => s + c.delivered, 0);
    const totalReplied = Object.values(channelBreakdown).reduce((s, c) => s + c.replied, 0);

    // Sentiment distribution from interaction_events details
    const sentimentCounts: Record<string, number> = {};
    for (const rid of recordIds) {
      const interactions = await db.select().from(interactionEvents).where(eq(interactionEvents.recordId, rid)).execute();
      for (const int of interactions) {
        const details = int.details as any;
        if (details?.sentiment) {
          sentimentCounts[details.sentiment] = (sentimentCounts[details.sentiment] || 0) + 1;
        }
      }
    }

    // PTP history
    let ptpTotal = 0, ptpHonored = 0, ptpBroken = 0;
    for (const rid of recordIds) {
      const ptpEvents = await db.select().from(interactionEvents)
        .where(and(eq(interactionEvents.recordId, rid), eq(interactionEvents.interactionType, 'ptp')))
        .execute();
      ptpTotal += ptpEvents.length;
      for (const p of ptpEvents) {
        const d = p.details as any;
        if (d?.ptpStatus === 'honored') ptpHonored++;
        if (d?.ptpStatus === 'broken') ptpBroken++;
      }
    }

    // Repayment trend (last 10)
    const repayments: any[] = [];
    for (const rid of recordIds) {
      const reps = await db.select().from(repaymentRecords)
        .where(eq(repaymentRecords.portfolioRecordId, rid))
        .orderBy(desc(repaymentRecords.createdAt)).limit(10).execute();
      repayments.push(...reps);
    }
    repayments.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const repaymentTrend = repayments.slice(0, 10).map(r => ({
      amount: r.amount,
      date: r.paymentDate,
      type: r.paymentType,
    }));

    // Best channel (highest delivery rate)
    let bestChannel = 'sms';
    let bestRate = 0;
    for (const [ch, stats] of Object.entries(channelBreakdown)) {
      const rate = stats.sent > 0 ? stats.delivered / stats.sent : 0;
      if (rate > bestRate) { bestRate = rate; bestChannel = ch; }
    }

    const summary = {
      channelBreakdown,
      totalSent,
      totalDelivered,
      totalReplied,
      deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      replyRate: totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0,
      sentimentDistribution: sentimentCounts,
      ptpHistory: { total: ptpTotal, honored: ptpHonored, broken: ptpBroken },
      repaymentTrend,
      bestChannel,
      recordCount: recordIds.length,
    };

    // Store in feedbackSummary for caching
    try {
      await db.update(portfolioRecords)
        .set({ feedbackSummary: summary })
        .where(eq(portfolioRecords.id, id))
        .execute();
    } catch (e) { /* non-critical */ }

    return { data: summary };
  }

  /**
   * 360° Unified Timeline: Merges comm_events (with delivery_logs),
   * interaction_events (with transcripts + recordings), repayment_records,
   * and ai_insights into a single chronological feed.
   * Merges across ALL records for the same borrower (by mobile).
   */
  @Get(':id/timeline')
  @ApiResponseConfig({
    message: 'Record timeline retrieved',
    apiCode: 'RECORD_TIMELINE_RETRIEVED',
  })
  async getTimeline(@Param('id') id: string) {
    this.logger.log(`[Timeline] Fetching 360° timeline for record ${id}`);
    const tenantId = TenantContext.tenantId!;
    const timeline: any[] = [];

    // Find all records for this borrower (same mobile) for cross-record merge
    const [currentRecord] = await db.select({ mobile: portfolioRecords.mobile })
      .from(portfolioRecords).where(eq(portfolioRecords.id, id)).execute();
    if (!currentRecord) return { data: [] };

    const allRecords = await db.select({ id: portfolioRecords.id, portfolioId: portfolioRecords.portfolioId })
      .from(portfolioRecords)
      .where(and(eq(portfolioRecords.tenantId, tenantId), eq(portfolioRecords.mobile, currentRecord.mobile)))
      .execute();
    const recordIds = allRecords.map(r => r.id);
    this.logger.log(`[Timeline] Found ${recordIds.length} records for mobile ${currentRecord.mobile}`);

    for (const rid of recordIds) {
      const sourceRecordId = rid;

      // 1. Comm Events + Delivery Logs
      try {
        const events = await db.select().from(commEvents)
          .where(eq(commEvents.recordId, rid))
          .orderBy(desc(commEvents.createdAt)).execute();

        for (const event of events) {
          const logs = await db.select().from(deliveryLogs)
            .where(eq(deliveryLogs.eventId, event.id))
            .orderBy(desc(deliveryLogs.createdAt)).execute();
          const latestLog = logs[0];

          timeline.push({
            id: event.id,
            type: 'communication',
            category: 'comm',
            channel: event.channel,
            status: latestLog?.deliveryStatus || event.status,
            timestamp: event.sentAt || event.scheduledAt || event.createdAt,
            sourceRecordId,
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
      } catch (err: any) {
        this.logger.warn(`[Timeline] Could not load comm events for ${rid}: ${err.message}`);
      }

      // 2. Interaction Events + Transcripts + Call Recordings
      try {
        const interactions = await db.select().from(interactionEvents)
          .where(eq(interactionEvents.recordId, rid))
          .orderBy(desc(interactionEvents.createdAt)).execute();

        for (const interaction of interactions) {
          // Fetch transcript if exists
          let transcript: any = null;
          try {
            const [t] = await db.select().from(conversationTranscripts)
              .where(eq(conversationTranscripts.interactionId, interaction.id)).execute();
            if (t) transcript = { text: t.transcriptText, confidence: t.confidence };
          } catch { /* table may not have data */ }

          // Fetch call recording if exists
          let recording: any = null;
          try {
            const [r] = await db.select().from(callRecordings)
              .where(eq(callRecordings.interactionId, interaction.id)).execute();
            if (r) recording = { audioUrl: r.s3AudioUrl, durationSeconds: r.durationSeconds };
          } catch { /* table may not have data */ }

          const details = interaction.details as any || {};
          timeline.push({
            id: interaction.id,
            type: 'interaction',
            category: interaction.interactionType,
            channel: interaction.channel,
            status: null,
            timestamp: interaction.createdAt,
            sourceRecordId,
            details: {
              ...details,
              transcript,
              recording,
            },
          });
        }
      } catch (err: any) {
        this.logger.warn(`[Timeline] Could not load interactions for ${rid}: ${err.message}`);
      }

      // 3. Repayment Records
      try {
        const reps = await db.select().from(repaymentRecords)
          .where(eq(repaymentRecords.portfolioRecordId, rid))
          .orderBy(desc(repaymentRecords.createdAt)).execute();

        for (const repayment of reps) {
          timeline.push({
            id: repayment.id,
            type: 'repayment',
            category: 'payment',
            channel: null,
            status: 'completed',
            timestamp: repayment.createdAt || repayment.paymentDate,
            sourceRecordId,
            details: {
              amount: repayment.amount,
              paymentDate: repayment.paymentDate,
              paymentType: repayment.paymentType,
              reference: repayment.reference,
            },
          });
        }
      } catch (err: any) {
        this.logger.warn(`[Timeline] Could not load repayments for ${rid}: ${err.message}`);
      }

      // 4. AI Insights
      try {
        const insights = await db.select().from(aiInsights)
          .where(eq(aiInsights.recordId, rid))
          .orderBy(desc(aiInsights.generatedAt)).execute();

        for (const insight of insights) {
          timeline.push({
            id: insight.id,
            type: 'insight',
            category: insight.insightType || 'ai_insight',
            channel: null,
            status: null,
            timestamp: insight.generatedAt,
            sourceRecordId,
            details: {
              content: insight.content,
              confidence: insight.confidence,
              createdBy: insight.createdBy,
            },
          });
        }
      } catch (err: any) {
        this.logger.warn(`[Timeline] Could not load AI insights for ${rid}: ${err.message}`);
      }
    }

    // Sort all events chronologically (newest first)
    timeline.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    this.logger.log(`[Timeline] Returning ${timeline.length} total events for borrower`);
    return { data: timeline };
  }
}
