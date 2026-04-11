import { Injectable } from '@nestjs/common';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { db, segments, portfolioRecords } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

// ─── Criteria Evaluator Types ─────────────────────────────────

export interface CriteriaCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'between';
  value: any;
}

export interface CriteriaGroup {
  logic: 'AND' | 'OR';
  conditions: (CriteriaCondition | CriteriaGroup)[];
}

function isGroup(c: CriteriaCondition | CriteriaGroup): c is CriteriaGroup {
  return 'logic' in c && 'conditions' in c;
}

// Core fields mapped directly on portfolio_records (not inside dynamic_fields)
const CORE_FIELDS = new Set([
  'user_id', 'mobile', 'name', 'product', 'employer_id',
  'outstanding', 'current_dpd', 'dpd_bucket', 'total_repaid',
]);

/**
 * Evaluates a single criteria_jsonb group against a portfolio record.
 * Supports arbitrary nesting of AND/OR groups with typed operators.
 */
export function evaluateCriteria(
  criteria: CriteriaGroup,
  record: { dynamicFields?: Record<string, any>;[key: string]: any },
): boolean {
  const evalCondition = (cond: CriteriaCondition): boolean => {
    // Resolve value from either core field or dynamic_fields
    let fieldValue: any;
    if (CORE_FIELDS.has(cond.field)) {
      // Convert snake_case to camelCase for record property access
      const camel = cond.field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      fieldValue = record[camel];
    } else {
      fieldValue = record.dynamicFields?.[cond.field];
    }

    // Coerce numeric comparisons
    const numVal = Number(fieldValue);
    const numTarget = Number(cond.value);
    const isNumeric = !isNaN(numVal) && !isNaN(numTarget);

    switch (cond.operator) {
      case 'eq':
        return String(fieldValue) === String(cond.value);
      case 'neq':
        return String(fieldValue) !== String(cond.value);
      case 'gt':
        return isNumeric && numVal > numTarget;
      case 'gte':
        return isNumeric && numVal >= numTarget;
      case 'lt':
        return isNumeric && numVal < numTarget;
      case 'lte':
        return isNumeric && numVal <= numTarget;
      case 'in':
        return Array.isArray(cond.value) && cond.value.map(String).includes(String(fieldValue));
      case 'not_in':
        return Array.isArray(cond.value) && !cond.value.map(String).includes(String(fieldValue));
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(String(cond.value).toLowerCase());
      case 'between':
        if (!Array.isArray(cond.value) || cond.value.length !== 2) return false;
        const [min, max] = cond.value.map(Number);
        return isNumeric && numVal >= min && numVal <= max;
      default:
        return false;
    }
  };

  const evalNode = (node: CriteriaCondition | CriteriaGroup): boolean => {
    if (isGroup(node)) {
      return node.logic === 'AND'
        ? node.conditions.every(evalNode)
        : node.conditions.some(evalNode);
    }
    return evalCondition(node);
  };

  return evalNode(criteria);
}

@Injectable()
export class SegmentsService extends BaseRepository<typeof segments> {
  constructor() {
    super(segments, db);
  }

  async createSegment(data: typeof segments.$inferInsert) {
    return this._db.insert(segments).values(data).returning();
  }

  async findAllWithCounts() {
    const segmentList = await this.findMany({ orderBy: desc(segments.priority) });

    // Attach record counts
    const result = await Promise.all(
      segmentList.map(async (seg: any) => {
        const [countResult] = await this._db
          .select({ value: count() })
          .from(portfolioRecords)
          .where(eq(portfolioRecords.segmentId, seg.id))
          .execute();
        return { ...seg, recordCount: Number(countResult?.value || 0) };
      }),
    );
    return result;
  }

  async findById(id: string) {
    const seg = await this.findFirst(eq(segments.id, id));
    if (!seg) return null;
    // Attach record count
    const [countResult] = await this._db
      .select({ value: count() })
      .from(portfolioRecords)
      .where(eq(portfolioRecords.segmentId, id))
      .execute();
    return { ...seg, recordCount: Number(countResult?.value || 0) };
  }

  async updateSegment(id: string, data: Partial<typeof segments.$inferInsert>) {
    return this._db
      .update(segments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(segments.id, id))
      .returning();
  }

  async deleteSegment(id: string) {
    return this._db
      .update(segments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(segments.id, id))
      .returning();
  }

  async getDefaultSegment(tenantId: string) {
    const existing = await this._db
      .select()
      .from(segments)
      .where(and(eq(segments.tenantId, tenantId), eq(segments.isDefault, true)))
      .limit(1)
      .execute();

    if (existing.length > 0) return existing[0];

    // Auto-create default "Others" segment
    const [created] = await this._db
      .insert(segments)
      .values({
        tenantId,
        name: 'Others',
        code: 'others',
        description: 'Default catch-all segment for unmatched records',
        isDefault: true,
        isActive: true,
        priority: 999,
        criteriaJsonb: { logic: 'AND', conditions: [] },
      })
      .returning();
    return created;
  }

  async getActiveSegmentsByPriority(tenantId: string) {
    return this._db
      .select()
      .from(segments)
      .where(and(eq(segments.tenantId, tenantId), eq(segments.isActive, true)))
      .orderBy(segments.priority)
      .execute();
  }

  async updateSuccessRate(segmentId: string, rate: number) {
    return this._db
      .update(segments)
      .set({ successRate: String(rate), updatedAt: new Date() })
      .where(eq(segments.id, segmentId))
      .returning();
  }
}
