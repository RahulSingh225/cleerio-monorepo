import { KafkaService } from './kafka.service';
export declare class KafkaController {
    private readonly kafkaService;
    constructor(kafkaService: KafkaService);
    handlePortfolioIngest(message: any): Promise<void>;
}
