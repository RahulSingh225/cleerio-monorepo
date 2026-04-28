import { Injectable, Logger } from '@nestjs/common';
import { db, portfolioRecords, commEvents, deliveryLogs, repaymentRecords, savedQueries } from '@platform/drizzle';
import { eq, and, or, ne, gt, gte, lt, lte, like, inArray, isNull, isNotNull, sql, desc, asc, count, sum, avg, min, max, SQL } from 'drizzle-orm';
import { TenantContext } from '@platform/tenant';
import * as Papa from 'papaparse';

// ── Types ──────────────────────────────────────────────────

export interface FilterRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'is_null' | 'is_not_null';
  value: any;
  source: 'core' | 'dynamic' | 'comm' | 'repayment';
}

export interface Aggregation {
  field: string;
  fn: 'count' | 'sum' | 'avg' | 'min' | 'max';
  alias: string;
}

export interface DataExplorerQuery {
  filters: FilterRule[];
  columns: string[];
  groupBy?: string;
  aggregations?: Aggregation[];
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ── Core field map (camelCase → column reference) ──────────

const CORE_FIELD_MAP: Record<string, any> = {
  id: portfolioRecords.id,
  userId: portfolioRecords.userId,
  mobile: portfolioRecords.mobile,
  name: portfolioRecords.name,
  product: portfolioRecords.product,
  employerName: portfolioRecords.employerName,
  outstanding: portfolioRecords.outstanding,
  currentDpd: portfolioRecords.currentDpd,
  loanNumber: portfolioRecords.loanNumber,
  email: portfolioRecords.email,
  dueDate: portfolioRecords.dueDate,
  emiAmount: portfolioRecords.emiAmount,
  language: portfolioRecords.language,
  state: portfolioRecords.state,
  city: portfolioRecords.city,
  cibilScore: portfolioRecords.cibilScore,
  salaryDate: portfolioRecords.salaryDate,
  enachEnabled: portfolioRecords.enachEnabled,
  loanAmount: portfolioRecords.loanAmount,
  segmentId: portfolioRecords.segmentId,
  totalRepaid: portfolioRecords.totalRepaid,
  lastDeliveryStatus: portfolioRecords.lastDeliveryStatus,
  lastContactedChannel: portfolioRecords.lastContactedChannel,
  contactabilityScore: portfolioRecords.contactabilityScore,
  totalCommAttempts: portfolioRecords.totalCommAttempts,
  totalCommDelivered: portfolioRecords.totalCommDelivered,
  totalCommRead: portfolioRecords.totalCommRead,
  totalCommReplied: portfolioRecords.totalCommReplied,
  ptpStatus: portfolioRecords.ptpStatus,
  ptpDate: portfolioRecords.ptpDate,
  riskBucket: portfolioRecords.riskBucket,
  preferredChannel: portfolioRecords.preferredChannel,
  isOptedOut: portfolioRecords.isOptedOut,
  createdAt: portfolioRecords.createdAt,
};

@Injectable()
export class DataExplorerService {
  private readonly logger = new Logger(DataExplorerService.name);

  /**
   * Execute a Data Explorer query and return matching rows.
   */
  async executeQuery(query: DataExplorerQuery): Promise<{ data: any[]; totalCount: number }> {
    const tenantId = TenantContext.tenantId!;
    this.logger.log(`[DataExplorer] Executing query for tenant ${tenantId} with ${query.filters.length} filters`);

    const needsCommJoin = !!(query.filters.some(f => f.source === 'comm') ||
      query.columns?.some(c => c.startsWith('comm.')) ||
      query.groupBy?.startsWith('comm.'));

    const needsRepaymentJoin = !!(query.filters.some(f => f.source === 'repayment') ||
      query.columns?.some(c => c.startsWith('repayment.')) ||
      query.groupBy?.startsWith('repayment.'));

    // ── Build the raw SQL query ──────────────────────────────
    if (query.groupBy) {
      return this.executeGroupedQuery(query, tenantId, needsCommJoin, needsRepaymentJoin);
    }

    return this.executeFlatQuery(query, tenantId, needsCommJoin, needsRepaymentJoin);
  }

  /**
   * Flat query — no GROUP BY, returns individual records.
   */
  private async executeFlatQuery(
    query: DataExplorerQuery,
    tenantId: string,
    needsCommJoin: boolean,
    needsRepaymentJoin: boolean,
  ): Promise<{ data: any[]; totalCount: number }> {
    // Build SELECT columns
    const selectFields: Record<string, any> = {};
    const requestedColumns = query.columns?.length > 0 ? query.columns : Object.keys(CORE_FIELD_MAP);

    for (const col of requestedColumns) {
      if (col.startsWith('dynamic.')) {
        const key = col.replace('dynamic.', '');
        selectFields[col] = sql`${portfolioRecords.dynamicFields}->>${key}`;
      } else if (col.startsWith('comm.')) {
        // Comm fields handled via join
        const key = col.replace('comm.', '');
        if (key === 'channel') selectFields[col] = commEvents.channel;
        else if (key === 'status') selectFields[col] = commEvents.status;
        else if (key === 'deliveryStatus') selectFields[col] = deliveryLogs.deliveryStatus;
        else if (key === 'sentAt') selectFields[col] = commEvents.sentAt;
      } else if (col.startsWith('repayment.')) {
        const key = col.replace('repayment.', '');
        if (key === 'amount') selectFields[col] = repaymentRecords.amount;
        else if (key === 'paymentDate') selectFields[col] = repaymentRecords.paymentDate;
        else if (key === 'paymentType') selectFields[col] = repaymentRecords.paymentType;
      } else if (CORE_FIELD_MAP[col]) {
        selectFields[col] = CORE_FIELD_MAP[col];
      }
    }

    // Always include id for row identification
    if (!selectFields['id']) {
      selectFields['id'] = portfolioRecords.id;
    }

    // Build WHERE conditions
    const conditions = this.buildWhereConditions(query.filters, tenantId);

    // Build query with optional joins
    let baseQuery: any;

    if (needsCommJoin && needsRepaymentJoin) {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .leftJoin(commEvents, eq(commEvents.recordId, portfolioRecords.id))
        .leftJoin(deliveryLogs, eq(deliveryLogs.eventId, commEvents.id))
        .innerJoin(repaymentRecords, eq(repaymentRecords.portfolioRecordId, portfolioRecords.id))
        .where(and(...conditions));
    } else if (needsCommJoin) {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .leftJoin(commEvents, eq(commEvents.recordId, portfolioRecords.id))
        .leftJoin(deliveryLogs, eq(deliveryLogs.eventId, commEvents.id))
        .where(and(...conditions));
    } else if (needsRepaymentJoin) {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .innerJoin(repaymentRecords, eq(repaymentRecords.portfolioRecordId, portfolioRecords.id))
        .where(and(...conditions));
    } else {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .where(and(...conditions));
    }

    // Sorting
    if (query.sortBy) {
      const sortCol = this.resolveFieldRef(query.sortBy);
      if (sortCol) {
        baseQuery = baseQuery.orderBy(query.sortDir === 'desc' ? desc(sortCol) : asc(sortCol));
      }
    } else {
      baseQuery = baseQuery.orderBy(desc(portfolioRecords.createdAt));
    }

    // Pagination
    const limit = Math.min(query.limit || 1000, 1000);
    const offset = query.offset || 0;

    const data = await baseQuery.limit(limit).offset(offset).execute();

    // Get total count (separate lightweight query)
    let countQuery: any;
    if (needsCommJoin && needsRepaymentJoin) {
      countQuery = db.select({ value: count() })
        .from(portfolioRecords)
        .leftJoin(commEvents, eq(commEvents.recordId, portfolioRecords.id))
        .leftJoin(deliveryLogs, eq(deliveryLogs.eventId, commEvents.id))
        .innerJoin(repaymentRecords, eq(repaymentRecords.portfolioRecordId, portfolioRecords.id))
        .where(and(...conditions));
    } else if (needsCommJoin) {
      countQuery = db.select({ value: count() })
        .from(portfolioRecords)
        .leftJoin(commEvents, eq(commEvents.recordId, portfolioRecords.id))
        .leftJoin(deliveryLogs, eq(deliveryLogs.eventId, commEvents.id))
        .where(and(...conditions));
    } else if (needsRepaymentJoin) {
      countQuery = db.select({ value: count() })
        .from(portfolioRecords)
        .innerJoin(repaymentRecords, eq(repaymentRecords.portfolioRecordId, portfolioRecords.id))
        .where(and(...conditions));
    } else {
      countQuery = db.select({ value: count() })
        .from(portfolioRecords)
        .where(and(...conditions));
    }

    const [countResult] = await countQuery.execute();
    const totalCount = Number(countResult?.value || 0);

    this.logger.log(`[DataExplorer] Query returned ${data.length} rows (total: ${totalCount})`);
    return { data, totalCount };
  }

  /**
   * Grouped query — with GROUP BY and aggregations.
   */
  private async executeGroupedQuery(
    query: DataExplorerQuery,
    tenantId: string,
    needsCommJoin: boolean,
    needsRepaymentJoin: boolean,
  ): Promise<{ data: any[]; totalCount: number }> {
    const groupByRef = this.resolveFieldRef(query.groupBy!);
    if (!groupByRef) {
      throw new Error(`Cannot group by unknown field: ${query.groupBy}`);
    }

    // Build aggregation select
    const selectFields: Record<string, any> = {
      groupKey: groupByRef,
      recordCount: count(),
    };

    if (query.aggregations) {
      for (const agg of query.aggregations) {
        const fieldRef = this.resolveFieldRef(agg.field);
        if (!fieldRef) continue;

        switch (agg.fn) {
          case 'sum': selectFields[agg.alias] = sum(fieldRef); break;
          case 'avg': selectFields[agg.alias] = avg(fieldRef); break;
          case 'min': selectFields[agg.alias] = min(fieldRef); break;
          case 'max': selectFields[agg.alias] = max(fieldRef); break;
          case 'count': selectFields[agg.alias] = count(fieldRef); break;
        }
      }
    }

    const conditions = this.buildWhereConditions(query.filters, tenantId);

    let baseQuery: any;

    if (needsCommJoin && needsRepaymentJoin) {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .leftJoin(commEvents, eq(commEvents.recordId, portfolioRecords.id))
        .leftJoin(deliveryLogs, eq(deliveryLogs.eventId, commEvents.id))
        .innerJoin(repaymentRecords, eq(repaymentRecords.portfolioRecordId, portfolioRecords.id))
        .where(and(...conditions))
        .groupBy(groupByRef);
    } else if (needsCommJoin) {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .leftJoin(commEvents, eq(commEvents.recordId, portfolioRecords.id))
        .leftJoin(deliveryLogs, eq(deliveryLogs.eventId, commEvents.id))
        .where(and(...conditions))
        .groupBy(groupByRef);
    } else if (needsRepaymentJoin) {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .innerJoin(repaymentRecords, eq(repaymentRecords.portfolioRecordId, portfolioRecords.id))
        .where(and(...conditions))
        .groupBy(groupByRef);
    } else {
      baseQuery = db.select(selectFields)
        .from(portfolioRecords)
        .where(and(...conditions))
        .groupBy(groupByRef);
    }

    // Sort grouped results by count descending by default
    baseQuery = baseQuery.orderBy(desc(count()));

    const data = await baseQuery.limit(1000).execute();

    this.logger.log(`[DataExplorer] Grouped query returned ${data.length} groups`);
    return { data, totalCount: data.length };
  }

  /**
   * Generate CSV string from query results.
   */
  async exportCsv(query: DataExplorerQuery): Promise<string> {
    // For export, remove limit cap
    const exportQuery = { ...query, limit: 50000, offset: 0 };
    const { data } = await this.executeQuery(exportQuery);

    return Papa.unparse(data, {
      header: true,
      quotes: true,
    });
  }

  // ── Saved Queries CRUD ─────────────────────────────────────

  async saveQuery(data: { name: string; description?: string; querySpec: DataExplorerQuery; createdBy?: string }) {
    const tenantId = TenantContext.tenantId!;
    const [saved] = await db.insert(savedQueries).values({
      tenantId,
      name: data.name,
      description: data.description,
      querySpec: data.querySpec,
      createdBy: data.createdBy,
    }).returning();
    return saved;
  }

  async getSavedQueries() {
    const tenantId = TenantContext.tenantId!;
    return db.select()
      .from(savedQueries)
      .where(eq(savedQueries.tenantId, tenantId))
      .orderBy(desc(savedQueries.updatedAt))
      .execute();
  }

  async deleteSavedQuery(id: string) {
    const tenantId = TenantContext.tenantId!;
    return db.delete(savedQueries)
      .where(and(eq(savedQueries.id, id), eq(savedQueries.tenantId, tenantId)))
      .returning();
  }

  // ── Private helpers ────────────────────────────────────────

  /**
   * Resolve a field string to a Drizzle column reference.
   * Supports core fields, dynamic fields (dynamic.xyz), comm fields, and repayment fields.
   */
  private resolveFieldRef(field: string): any {
    if (field.startsWith('dynamic.')) {
      const key = field.replace('dynamic.', '');
      return sql`${portfolioRecords.dynamicFields}->>'${sql.raw(key)}'`;
    }
    if (field.startsWith('comm.')) {
      const key = field.replace('comm.', '');
      if (key === 'channel') return commEvents.channel;
      if (key === 'status') return commEvents.status;
      if (key === 'deliveryStatus') return deliveryLogs.deliveryStatus;
      if (key === 'sentAt') return commEvents.sentAt;
      if (key === 'errorCode') return deliveryLogs.errorCode;
      if (key === 'errorMessage') return deliveryLogs.errorMessage;
      return null;
    }
    if (field.startsWith('repayment.')) {
      const key = field.replace('repayment.', '');
      if (key === 'amount') return repaymentRecords.amount;
      if (key === 'paymentDate') return repaymentRecords.paymentDate;
      if (key === 'paymentType') return repaymentRecords.paymentType;
      if (key === 'reference') return repaymentRecords.reference;
      return null;
    }
    return CORE_FIELD_MAP[field] || null;
  }

  /**
   * Build WHERE conditions from filter rules.
   */
  private buildWhereConditions(filters: FilterRule[], tenantId: string): SQL[] {
    const conditions: SQL[] = [
      eq(portfolioRecords.tenantId, tenantId),
    ];

    for (const filter of filters) {
      const fieldRef = this.resolveFieldRef(
        filter.source === 'dynamic' && !filter.field.startsWith('dynamic.')
          ? `dynamic.${filter.field}`
          : filter.source === 'comm' && !filter.field.startsWith('comm.')
            ? `comm.${filter.field}`
            : filter.source === 'repayment' && !filter.field.startsWith('repayment.')
              ? `repayment.${filter.field}`
              : filter.field
      );

      if (!fieldRef) {
        this.logger.warn(`[DataExplorer] Skipping unknown filter field: ${filter.field} (source: ${filter.source})`);
        continue;
      }

      // Special case: "hasRepayment" is a boolean flag filter
      if (filter.field === 'hasRepayment') {
        // This is handled by the INNER JOIN on repayment_records — no extra WHERE needed
        continue;
      }

      switch (filter.operator) {
        case 'eq':
          conditions.push(eq(fieldRef, filter.value));
          break;
        case 'neq':
          conditions.push(ne(fieldRef, filter.value));
          break;
        case 'gt':
          conditions.push(gt(fieldRef, filter.value));
          break;
        case 'gte':
          conditions.push(gte(fieldRef, filter.value));
          break;
        case 'lt':
          conditions.push(lt(fieldRef, filter.value));
          break;
        case 'lte':
          conditions.push(lte(fieldRef, filter.value));
          break;
        case 'in':
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            conditions.push(inArray(fieldRef, filter.value));
          }
          break;
        case 'contains':
          conditions.push(like(fieldRef, `%${filter.value}%`));
          break;
        case 'is_null':
          conditions.push(isNull(fieldRef));
          break;
        case 'is_not_null':
          conditions.push(isNotNull(fieldRef));
          break;
      }
    }

    return conditions;
  }
}
