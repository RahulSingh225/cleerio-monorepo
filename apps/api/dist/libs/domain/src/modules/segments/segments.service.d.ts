import { segments } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export interface CriteriaCondition {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'between';
    value: any;
}
export interface CriteriaGroup {
    logic: 'AND' | 'OR';
    conditions: (CriteriaCondition | CriteriaGroup)[];
}
export declare function evaluateCriteria(criteria: CriteriaGroup, record: {
    dynamicFields?: Record<string, any>;
    [key: string]: any;
}): boolean;
export declare class SegmentsService extends BaseRepository<typeof segments> {
    constructor();
    createSegment(data: typeof segments.$inferInsert): Promise<{
        id: string;
        name: string;
        code: string;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        priority: number | null;
        isActive: boolean | null;
        description: string | null;
        isDefault: boolean | null;
        criteriaJsonb: unknown;
        successRate: string | null;
    }[]>;
    findAllWithCounts(): Promise<any[]>;
    findById(id: string): Promise<{
        [x: string]: any;
    }>;
    updateSegment(id: string, data: Partial<typeof segments.$inferInsert>): Promise<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isDefault: boolean | null;
        isActive: boolean | null;
        priority: number | null;
        criteriaJsonb: unknown;
        successRate: string | null;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    deleteSegment(id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isDefault: boolean | null;
        isActive: boolean | null;
        priority: number | null;
        criteriaJsonb: unknown;
        successRate: string | null;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getDefaultSegment(tenantId: string): Promise<{
        id: string;
        name: string;
        code: string;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        priority: number | null;
        isActive: boolean | null;
        description: string | null;
        isDefault: boolean | null;
        criteriaJsonb: unknown;
        successRate: string | null;
    }>;
    getActiveSegmentsByPriority(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isDefault: boolean | null;
        isActive: boolean | null;
        priority: number | null;
        criteriaJsonb: unknown;
        successRate: string | null;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    updateSuccessRate(segmentId: string, rate: number): Promise<{
        id: string;
        tenantId: string;
        name: string;
        code: string;
        description: string | null;
        isDefault: boolean | null;
        isActive: boolean | null;
        priority: number | null;
        criteriaJsonb: unknown;
        successRate: string | null;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
}
