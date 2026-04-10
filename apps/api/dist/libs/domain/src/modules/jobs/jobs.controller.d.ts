import { JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(limit?: number): Promise<{
        id: string;
        tenantId: string | null;
        jobType: string;
        status: string | null;
        payload: unknown;
        kafkaTopic: string | null;
        kafkaKey: string | null;
        priority: number | null;
        attempts: number | null;
        runAfter: Date | null;
        completedAt: Date | null;
        failedAt: Date | null;
        lastError: string | null;
        result: unknown;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    findByTenant(tenantId: string, limit?: number): Promise<{
        id: string;
        tenantId: string | null;
        jobType: string;
        status: string | null;
        payload: unknown;
        kafkaTopic: string | null;
        kafkaKey: string | null;
        priority: number | null;
        attempts: number | null;
        runAfter: Date | null;
        completedAt: Date | null;
        failedAt: Date | null;
        lastError: string | null;
        result: unknown;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
}
