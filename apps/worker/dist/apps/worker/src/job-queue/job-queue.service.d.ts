import { jobQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { PortfoliosService, PortfolioRecordsService, WorkflowRulesService, EligibilityService } from '@platform/domain';
export declare class JobQueueService extends BaseRepository<typeof jobQueue> {
    private readonly portfolioService;
    private readonly recordsService;
    private readonly workflowService;
    private readonly eligibilityService;
    private readonly logger;
    constructor(portfolioService: PortfoliosService, recordsService: PortfolioRecordsService, workflowService: WorkflowRulesService, eligibilityService: EligibilityService);
    processPendingJobs(): Promise<void>;
    handlePortfolioIngest(portfolioId: string, tenantId: string): Promise<void>;
}
