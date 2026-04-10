import { optOutList } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class OptOutService extends BaseRepository<typeof optOutList> {
    constructor();
    addToOptOut(data: {
        tenantId?: string;
        mobile: string;
        channel?: string;
        reason?: string;
        source?: string;
    }): Promise<{
        id: string;
        tenantId: string | null;
        mobile: string;
        channel: string | null;
        reason: string | null;
        source: string | null;
        optedOutAt: Date | null;
    }[]>;
    removeFromOptOut(id: string): Promise<{
        id: string;
        tenantId: string | null;
        mobile: string;
        channel: string | null;
        reason: string | null;
        source: string | null;
        optedOutAt: Date | null;
    }[]>;
    checkOptOut(tenantId: string, mobile: string, channel?: string): Promise<boolean>;
}
