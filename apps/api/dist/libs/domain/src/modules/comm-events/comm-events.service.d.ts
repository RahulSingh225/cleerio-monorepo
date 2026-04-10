import { commEvents } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class CommEventsService extends BaseRepository<typeof commEvents> {
    constructor();
    findAllForTenant(filters?: {
        status?: string;
        channel?: string;
    }): Promise<{
        [x: string]: any;
    }[]>;
    findByRecord(recordId: string): Promise<{
        [x: string]: any;
    }[]>;
    cancelEvent(id: string): Promise<{
        [x: string]: any;
    }[]>;
}
