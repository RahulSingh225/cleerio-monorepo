import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @Roles('platform_admin')
  @ApiResponseConfig({ message: 'Tenant created successfully', apiCode: 'TENANT_CREATED' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.createTenant(createTenantDto);
  }

  @Get(':code')
  @ApiResponseConfig({ message: 'Tenant retrieved successfully', apiCode: 'TENANT_RETRIEVED' })
  async findOne(@Param('code') code: string) {
    return this.tenantsService.getTenantByCode(code);
  }

  @Get()
  @Roles('platform_admin', 'platform_ops')
  @ApiResponseConfig({ message: 'Tenants listed successfully', apiCode: 'TENANTS_LISTED' })
  async findAll() {
    return this.tenantsService.findMany();
  }

  @Get('by-id/:id')
  @ApiResponseConfig({ message: 'Tenant retrieved by ID', apiCode: 'TENANT_BY_ID' })
  async findById(@Param('id') id: string) {
    return this.tenantsService.getTenantById(id);
  }

  @Put(':id')
  @UseGuards(TenantRoleGuard)
  @Roles('platform_admin')
  @ApiResponseConfig({ message: 'Tenant updated successfully', apiCode: 'TENANT_UPDATED' })
  async update(@Param('id') id: string, @Body() data: Partial<CreateTenantDto>) {
    return this.tenantsService.updateTenant(id, data);
  }
}
