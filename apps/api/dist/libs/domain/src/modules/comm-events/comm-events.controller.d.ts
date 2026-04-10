import { CommEventsService } from './comm-events.service';
export declare class CommEventsController {
    private readonly service;
    constructor(service: CommEventsService);
    findAll(status?: string, channel?: string): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
    findByRecord(recordId: string): Promise<{
        [x: string]: any;
    }[]>;
    cancel(id: string): Promise<{
        [x: string]: any;
    }[]>;
}
