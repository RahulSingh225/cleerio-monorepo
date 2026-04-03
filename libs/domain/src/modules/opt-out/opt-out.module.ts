import { Module } from '@nestjs/common';
import { OptOutController } from './opt-out.controller';
import { OptOutService } from './opt-out.service';

@Module({
  controllers: [OptOutController],
  providers: [OptOutService],
  exports: [OptOutService],
})
export class OptOutModule {}
