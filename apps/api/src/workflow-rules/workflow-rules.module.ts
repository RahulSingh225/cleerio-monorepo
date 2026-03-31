import { Module } from '@nestjs/common';
import { WorkflowRulesService } from './workflow-rules.service';
import { EligibilityService } from './eligibility.service';
import { CommunicationService } from './communication.service';

@Module({
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
