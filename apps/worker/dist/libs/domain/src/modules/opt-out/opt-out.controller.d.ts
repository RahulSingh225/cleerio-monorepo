import { OptOutService } from './opt-out.service';
export declare class OptOutController {
    private readonly service;
    constructor(service: OptOutService);
    addToOptOut(body: {
        mobile: string;
        channel?: string;
        reason?: string;
        source?: string;
    }, req: any): Promise<{
        id: string;
        tenantId: string | null;
        mobile: string;
        channel: string | null;
        reason: string | null;
        source: string | null;
        optedOutAt: Date | null;
    }[]>;
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string | null;
        mobile: string;
        channel: string | null;
        reason: string | null;
        source: string | null;
        optedOutAt: Date | null;
    }[]>;
}
