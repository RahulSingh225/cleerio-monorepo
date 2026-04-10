import { segmentationRuns } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class SegmentationRunsService extends BaseRepository<typeof segmentationRuns> {
    constructor();
    startRun(tenantId: string, portfolioId?: string, triggeredBy?: string): Promise<{
        id: string;
        status: string | null;
        createdAt: Date | null;
        tenantId: string;
        totalRecords: number | null;
        portfolioId: string | null;
        triggeredBy: string | null;
        processed: number | null;
        completedAt: Date | null;
    }>;
    processRun(runId: string): Promise<{
        processed: number;
        total: number;
    }>;
    findByTenant(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        portfolioId: string | null;
        triggeredBy: string | null;
        status: string | null;
        totalRecords: number | null;
        processed: number | null;
        createdAt: Date | null;
        completedAt: Date | null;
    }[]>;
}
