import { ReportJobsService } from './report-jobs.service';
export declare class ReportJobsController {
    private readonly service;
    constructor(service: ReportJobsService);
    request(body: {
        reportType: string;
        filters?: any;
    }, req: any): Promise<{
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
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
}
