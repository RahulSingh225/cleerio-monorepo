import { taskQueue } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';
import { PortfoliosService, PortfolioRecordsService, SegmentationRunsService, TemplateRendererService, DeliveryLogsService } from '@platform/domain';
export declare class JobQueueService extends BaseRepository<typeof taskQueue> {
    private readonly portfolioService;
    private readonly recordsService;
    private readonly segmentationRunsService;
    private readonly templateRenderer;
    private readonly deliveryLogsService;
    private readonly logger;
    constructor(portfolioService: PortfoliosService, recordsService: PortfolioRecordsService, segmentationRunsService: SegmentationRunsService, templateRenderer: TemplateRendererService, deliveryLogsService: DeliveryLogsService);
    processPendingJobs(): Promise<void>;
    scheduleCommDispatch(): Promise<void>;
    handlePortfolioIngest(portfolioId: string, tenantId: string): Promise<void>;
    handleSegmentationRun(tenantId: string): Promise<void>;
    handleCommDispatch(tenantId: string, jobId: string): Promise<void>;
}
