import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly service;
    constructor(service: AuditLogsService);
    findAll(action?: string, entityType?: string): Promise<{
        [x: string]: any;
    }[]>;
}
