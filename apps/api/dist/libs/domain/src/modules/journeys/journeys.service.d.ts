import { journeys } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class JourneysService extends BaseRepository<typeof journeys> {
    constructor();
    createJourney(data: typeof journeys.$inferInsert): Promise<{
        id: string;
        name: string;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        description: string | null;
        isActive: boolean | null;
        segmentId: string;
        successMetric: string | null;
    }[]>;
    findAllWithDetails(): Promise<any[]>;
    findByIdWithSteps(id: string): Promise<{
        steps: {
            id: string;
            journeyId: string;
            stepOrder: number;
            actionType: string;
            channel: string | null;
            templateId: string | null;
            delayHours: number | null;
            repeatIntervalDays: number | null;
            scheduleCron: string | null;
            conditionsJsonb: unknown;
            providerOverride: unknown;
            createdBy: string | null;
            createdAt: Date | null;
            updatedAt: Date | null;
        }[];
        segment: {
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
        };
    } | null>;
    updateJourney(id: string, data: Partial<typeof journeys.$inferInsert>): Promise<{
        id: string;
        tenantId: string;
        segmentId: string;
        name: string;
        description: string | null;
        isActive: boolean | null;
        successMetric: string | null;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    deleteJourney(id: string): Promise<{
        id: string;
        name: string;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        description: string | null;
        isActive: boolean | null;
        segmentId: string;
        successMetric: string | null;
    }[]>;
    activate(id: string): Promise<{
        id: string;
        tenantId: string;
        segmentId: string;
        name: string;
        description: string | null;
        isActive: boolean | null;
        successMetric: string | null;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    deactivate(id: string): Promise<{
        id: string;
        tenantId: string;
        segmentId: string;
        name: string;
        description: string | null;
        isActive: boolean | null;
        successMetric: string | null;
        createdBy: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
}
