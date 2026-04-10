import { taskQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class JobsService extends BaseRepository<typeof taskQueue> {
    constructor();
    findAllJobs(limit?: number): Promise<{
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
    findJobsByTenant(tenantId: string, limit?: number): Promise<{
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
