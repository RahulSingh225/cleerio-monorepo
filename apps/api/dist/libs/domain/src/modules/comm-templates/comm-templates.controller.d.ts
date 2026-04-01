import { CommTemplatesService } from './comm-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
export declare class CommTemplatesController {
    private readonly templateService;
    constructor(templateService: CommTemplatesService);
    create(createTemplateDto: CreateTemplateDto): Promise<any[] | import("pg").QueryResult<never>>;
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
    findOne(id: string): Promise<{
        [x: string]: any;
    }>;
    delete(id: string): Promise<any[] | import("pg").QueryResult<never>>;
}
