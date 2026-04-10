import { DeliveryLogsService } from './delivery-logs.service';
export declare class DeliveryLogsController {
    private readonly service;
    constructor(service: DeliveryLogsService);
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
    findByEvent(eventId: string): Promise<{
        [x: string]: any;
    }[]>;
    handleWebhook(provider: string, payload: any): Promise<{
        received: boolean;
        processed: boolean;
    }>;
}
