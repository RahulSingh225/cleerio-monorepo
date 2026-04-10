import { reportJobs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class ReportJobsService extends BaseRepository<typeof reportJobs> {
    constructor();
    requestReport(data: {
        tenantId: string;
        requestedBy: string;
        reportType: string;
        filters?: any;
    }): Promise<{
        id: string;
        status: string;
        tenantId: string;
        fileUrl: string | null;
        completedAt: Date | null;
        errorMessage: string | null;
        jobId: string | null;
        requestedBy: string | null;
        reportType: string;
        filters: unknown;
        queuedAt: Date | null;
    }>;
    findAllForTenant(): Promise<{
        [x: string]: any;
    }[]>;
}
