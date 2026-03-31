import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { TenantFieldRegistryService } from './tenant-field-registry.service';
import { CreateFieldMappingDto } from './dto/create-field-mapping.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantGuard } from '@platform/tenant';

@Controller('tenant-field-registry')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TenantFieldRegistryController {
  constructor(private readonly registryService: TenantFieldRegistryService) {}

  @Post('mapping')
  @Roles('tenant_admin')
  @ApiResponseConfig({
    message: 'Field mapping successfully created',
    apiCode: 'FIELD_MAPPING_CREATED',
  })
  async createMapping(@Body() createFieldMappingDto: CreateFieldMappingDto) {
    // Note: tenantId is automatically handled by BaseRepository using AsyncLocalStorage
    return this.registryService.insert({ ...createFieldMappingDto });
  }

  @Get('mapping')
  @ApiResponseConfig({
    message: 'Field mappings retrieved successfully',
    apiCode: 'FIELD_MAPPINGS_RETRIEVED',
  })
  async getMapping() {
    return this.registryService.getMappingForTenant();
  }
}
