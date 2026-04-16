import { Module } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';
import { ReassignmentRulesService } from './reassignment-rules.service';

@Module({
  controllers: [SegmentsController],
  providers: [SegmentsService, ReassignmentRulesService],
  exports: [SegmentsService, ReassignmentRulesService],
})
export class SegmentsModule {}
