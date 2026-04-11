import { SegmentsService } from './segments.service';
export declare class SegmentsController {
    private readonly segmentsService;
    constructor(segmentsService: SegmentsService);
    create(body: any): Promise<{
        data: {
            id: string;
            name: string;
            code: string;
            createdBy: string | null;
            createdAt: Date | null;
            updatedAt: Date | null;
            tenantId: string;
            description: string | null;
            isDefault: boolean | null;
            priority: number | null;
            isActive: boolean | null;
            criteriaJsonb: unknown;
            successRate: string | null;
        };
    }>;
    runSegmentation(): Promise<{
        data: {
            status: string;
            message: string;
        };
    }>;
    findAll(): Promise<{
        data: any[];
    }>;
    findById(id: string): Promise<{
        data: {
            recordCount: number;
        } | null;
    }>;
    update(id: string, body: any): Promise<{
        data: {
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
    }>;
    delete(id: string): Promise<{
        data: {
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
    }>;
}
