import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { JourneyStepsService } from '../journey-steps/journey-steps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantContext } from '@platform/tenant';

@Controller('journeys')
@UseGuards(JwtAuthGuard, TenantRoleGuard)
export class JourneysController {
  constructor(
    private readonly journeysService: JourneysService,
    private readonly stepsService: JourneyStepsService,
  ) {}

  @Post()
  @Roles('tenant_admin', 'ops')
  async create(@Body() body: any) {
    const tenantId = TenantContext.tenantId;
    const [journey] = await this.journeysService.createJourney({
      ...body,
      tenantId,
    });
    return { data: journey };
  }

  @Get()
  async findAll() {
    const data = await this.journeysService.findAllWithDetails();
    return { data };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.journeysService.findByIdWithSteps(id);
    return { data };
  }

  @Put(':id')
  @Roles('tenant_admin', 'ops')
  async update(@Param('id') id: string, @Body() body: any) {
    const [updated] = await this.journeysService.updateJourney(id, body);
    return { data: updated };
  }

  @Delete(':id')
  @Roles('tenant_admin')
  async delete(@Param('id') id: string) {
    const [deleted] = await this.journeysService.deleteJourney(id);
    return { data: deleted };
  }

  // ─── Journey Steps CRUD ────────────────────────────────────

  @Post(':id/steps')
  @Roles('tenant_admin', 'ops')
  async addStep(@Param('id') journeyId: string, @Body() body: any) {
    const [step] = await this.stepsService.createStep({ ...body, journeyId });
    return { data: step };
  }

  @Put(':id/steps/:stepId')
  @Roles('tenant_admin', 'ops')
  async updateStep(@Param('stepId') stepId: string, @Body() body: any) {
    const [updated] = await this.stepsService.updateStep(stepId, body);
    return { data: updated };
  }

  @Delete(':id/steps/:stepId')
  @Roles('tenant_admin', 'ops')
  async deleteStep(@Param('stepId') stepId: string) {
    const [deleted] = await this.stepsService.deleteStep(stepId);
    return { data: deleted };
  }

  @Put(':id/steps/reorder')
  @Roles('tenant_admin', 'ops')
  async reorderSteps(@Param('id') journeyId: string, @Body() body: { stepIds: string[] }) {
    await this.stepsService.reorder(journeyId, body.stepIds);
    return { data: { success: true } };
  }

  @Post(':id/deploy')
  @Roles('tenant_admin')
  async deploy(@Param('id') id: string) {
    const [activated] = await this.journeysService.activate(id);
    return { data: activated };
  }
}
