import { DpdBucketConfigsService } from './dpd-bucket-configs.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
export declare class DpdBucketConfigsController {
    private readonly bucketService;
    constructor(bucketService: DpdBucketConfigsService);
    create(createBucketDto: CreateBucketDto): Promise<any[] | import("pg").QueryResult<never>>;
    findAll(): Promise<{
        [x: string]: any;
    }[]>;
    update(id: string, data: Partial<CreateBucketDto>): Promise<{
        [x: string]: any;
    }[]>;
}
