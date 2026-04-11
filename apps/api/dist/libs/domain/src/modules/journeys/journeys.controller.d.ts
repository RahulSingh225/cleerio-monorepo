import { JourneysService } from './journeys.service';
import { JourneyStepsService } from '../journey-steps/journey-steps.service';
export declare class JourneysController {
    private readonly journeysService;
    private readonly stepsService;
    constructor(journeysService: JourneysService, stepsService: JourneyStepsService);
    create(body: any): Promise<{
        data: {
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
        };
    }>;
    findAll(): Promise<{
        data: any[];
    }>;
    findById(id: string): Promise<{
        data: {
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
        } | null;
    }>;
    update(id: string, body: any): Promise<{
        data: {
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
        };
    }>;
    delete(id: string): Promise<{
        data: {
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
        };
    }>;
    addStep(journeyId: string, body: any): Promise<{
        data: {
            id: string;
            createdBy: string | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            channel: string | null;
            journeyId: string;
            stepOrder: number;
            actionType: string;
            templateId: string | null;
            delayHours: number | null;
            repeatIntervalDays: number | null;
            scheduleCron: string | null;
            conditionsJsonb: unknown;
            providerOverride: unknown;
        };
    }>;
    updateStep(stepId: string, body: any): Promise<{
        data: {
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
        };
    }>;
    deleteStep(stepId: string): Promise<{
        data: {
            id: string;
            createdBy: string | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            channel: string | null;
            journeyId: string;
            stepOrder: number;
            actionType: string;
            templateId: string | null;
            delayHours: number | null;
            repeatIntervalDays: number | null;
            scheduleCron: string | null;
            conditionsJsonb: unknown;
            providerOverride: unknown;
        };
    }>;
    reorderSteps(journeyId: string, body: {
        stepIds: string[];
    }): Promise<{
        data: {
            success: boolean;
        };
    }>;
    deploy(id: string): Promise<{
        data: {
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
        };
    }>;
}
