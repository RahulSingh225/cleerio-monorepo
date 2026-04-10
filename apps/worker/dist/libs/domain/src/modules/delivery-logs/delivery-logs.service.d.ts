import { deliveryLogs } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
export declare class DeliveryLogsService extends BaseRepository<typeof deliveryLogs> {
    constructor();
    createLog(data: typeof deliveryLogs.$inferInsert): Promise<{
        id: string;
        createdAt: Date | null;
        tenantId: string;
        providerName: string | null;
        eventId: string;
        providerMsgId: string | null;
        deliveryStatus: string | null;
        errorCode: string | null;
        errorMessage: string | null;
        deliveredAt: Date | null;
        readAt: Date | null;
        callbackPayload: unknown;
    }[]>;
    findByEvent(eventId: string): Promise<{
        [x: string]: any;
    }[]>;
    updateFromWebhook(providerMsgId: string, data: {
        deliveryStatus?: string;
        deliveredAt?: Date;
        readAt?: Date;
        errorCode?: string;
        errorMessage?: string;
        callbackPayload?: any;
    }): Promise<{
        id: string;
        eventId: string;
        tenantId: string;
        providerName: string | null;
        providerMsgId: string | null;
        deliveryStatus: string | null;
        errorCode: string | null;
        errorMessage: string | null;
        deliveredAt: Date | null;
        readAt: Date | null;
        callbackPayload: unknown;
        createdAt: Date | null;
    }[]>;
}
