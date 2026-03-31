import { Module } from '@nestjs/common';
import { WorkflowRulesController } from './workflow-rules.controller';
import { WorkflowRulesService } from './workflow-rules.service';
import { EligibilityService } from './eligibility.service';
import { CommunicationService } from './communication.service';

@Module({
  controllers: [WorkflowRulesController],
  providers: [
    WorkflowRulesService,
    EligibilityService,
    CommunicationService,
  ],
  exports: [
    WorkflowRulesService,
    EligibilityService,
    CommunicationService,
  ],
})
export class WorkflowRulesModule {}
