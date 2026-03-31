import { Controller, Post, Body, Get, UseGuards, Put, Param, Delete, Query } from '@nestjs/common';
import { WorkflowRulesService } from './workflow-rules.service';
import { CreateWorkflowRuleDto } from './dto/create-workflow-rule.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { eq } from 'drizzle-orm';
import { workflowRules } from '@platform/drizzle';

@Controller('workflow-rules')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WorkflowRulesController {
  constructor(private readonly workflowService: WorkflowRulesService) {}

  @Post()
  @ApiResponseConfig({
    message: 'Workflow rule created successfully',
    apiCode: 'WORKFLOW_RULE_CREATED',
  })
  async create(@Body() createWorkflowRuleDto: CreateWorkflowRuleDto) {
    return this.workflowService.insert(createWorkflowRuleDto);
  }

  @Get()
  @ApiResponseConfig({
    message: 'Workflow rules listed successfully',
    apiCode: 'WORKFLOW_RULES_LISTED',
  })
  async findAll(@Query('bucketId') bucketId?: string) {
    if (bucketId) {
      return this.workflowService.fetchActiveRulesForBucket(bucketId);
    }
    return this.workflowService.findMany();
  }

  @Put(':id')
  @ApiResponseConfig({
    message: 'Workflow rule updated successfully',
    apiCode: 'WORKFLOW_RULE_UPDATED',
  })
  async update(@Param('id') id: string, @Body() data: Partial<CreateWorkflowRuleDto>) {
    return this.workflowService.update(eq(workflowRules.id, id), data);
  }

  @Delete(':id')
  @ApiResponseConfig({
    message: 'Workflow rule deleted successfully',
    apiCode: 'WORKFLOW_RULE_DELETED',
  })
  async delete(@Param('id') id: string) {
    return this.workflowService.delete(eq(workflowRules.id, id));
  }
}
