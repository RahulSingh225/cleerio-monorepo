import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantContext } from '@platform/tenant';

@Controller('v1/segments')
@UseGuards(JwtAuthGuard, TenantRoleGuard)
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Post()
  @Roles('tenant_admin', 'ops')
  async create(@Body() body: any) {
    const tenantId = TenantContext.tenantId;
    const [segment] = await this.segmentsService.createSegment({
      ...body,
      tenantId,
    });
    return { data: segment };
  }

  @Get()
  async findAll() {
    const data = await this.segmentsService.findAllWithCounts();
    return { data };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.segmentsService.findById(id);
    return { data };
  }

  @Put(':id')
  @Roles('tenant_admin', 'ops')
  async update(@Param('id') id: string, @Body() body: any) {
    const [updated] = await this.segmentsService.updateSegment(id, body);
    return { data: updated };
  }

  @Delete(':id')
  @Roles('tenant_admin')
  async delete(@Param('id') id: string) {
    const [deleted] = await this.segmentsService.deleteSegment(id);
    return { data: deleted };
  }
}
