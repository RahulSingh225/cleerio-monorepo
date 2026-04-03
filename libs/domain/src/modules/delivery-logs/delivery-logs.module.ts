import { Module } from '@nestjs/common';
import { DeliveryLogsController } from './delivery-logs.controller';
import { DeliveryLogsService } from './delivery-logs.service';

@Module({
  controllers: [DeliveryLogsController],
  providers: [DeliveryLogsService],
  exports: [DeliveryLogsService],
})
export class DeliveryLogsModule {}
