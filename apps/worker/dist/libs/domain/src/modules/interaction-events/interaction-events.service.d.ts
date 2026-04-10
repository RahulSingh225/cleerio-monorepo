import { interactionEvents } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class InteractionEventsService extends BaseRepository<typeof interactionEvents> {
    constructor();
    createInteraction(data: typeof interactionEvents.$inferInsert): Promise<{
        id: string;
        createdAt: Date | null;
        tenantId: string;
        channel: string | null;
        recordId: string;
        journeyStepId: string | null;
        commEventId: string | null;
        interactionType: string;
        details: unknown;
    }[]>;
    findByRecord(recordId: string): Promise<{
        [x: string]: any;
    }[]>;
    findByTenant(tenantId: string, limit?: number): Promise<{
        [x: string]: any;
    }[]>;
}
