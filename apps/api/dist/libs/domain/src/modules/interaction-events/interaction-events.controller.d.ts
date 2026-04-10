import { InteractionEventsService } from './interaction-events.service';
export declare class InteractionEventsController {
    private readonly interactionsService;
    constructor(interactionsService: InteractionEventsService);
    findAll(limit?: string): Promise<{
        data: {
            [x: string]: any;
        }[];
    }>;
}
