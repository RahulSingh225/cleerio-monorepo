import { WorkflowRulesService } from './workflow-rules.service';
import { CreateWorkflowRuleDto } from './dto/create-workflow-rule.dto';
export declare class WorkflowRulesController {
    private readonly workflowService;
    constructor(workflowService: WorkflowRulesService);
    create(createWorkflowRuleDto: CreateWorkflowRuleDto): Promise<any[] | import("pg").QueryResult<never>>;
    findAll(bucketId?: string): Promise<{
        [x: string]: any;
    }[]>;
    update(id: string, data: Partial<CreateWorkflowRuleDto>): Promise<{
        [x: string]: any;
    }[]>;
    delete(id: string): Promise<any[] | import("pg").QueryResult<never>>;
}
