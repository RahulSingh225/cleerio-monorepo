import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';

@Controller()
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @EventPattern('portfolio.ingest')
  async handlePortfolioIngest(@Payload() message: any) {
    if (message.value) {
      await this.kafkaService.handlePortfolioIngested(message.value);
    }
  }
}
