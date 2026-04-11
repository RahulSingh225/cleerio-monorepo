import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { TenantFieldRegistryService } from './tenant-field-registry.service';
import { CreateFieldMappingDto } from './dto/create-field-mapping.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantGuard, TenantContext } from '@platform/tenant';
import { db, portfolioMappingProfiles } from '@platform/drizzle';
import { eq, and } from 'drizzle-orm';

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

  // ─── PORTFOLIO MAPPING PROFILES ──────────────────────────────

  @Get('profiles')
  @ApiResponseConfig({
    message: 'Mapping profiles retrieved',
    apiCode: 'MAPPING_PROFILES_RETRIEVED',
  })
  async getProfiles() {
    const tenantId = TenantContext.tenantId;
    return db
      .select()
      .from(portfolioMappingProfiles)
      .where(eq(portfolioMappingProfiles.tenantId, tenantId!))
      .orderBy(portfolioMappingProfiles.createdAt)
      .execute();
  }

  @Get('profiles/:id')
  @ApiResponseConfig({
    message: 'Mapping profile retrieved',
    apiCode: 'MAPPING_PROFILE_RETRIEVED',
  })
  async getProfile(@Param('id') id: string) {
    const [profile] = await db
      .select()
      .from(portfolioMappingProfiles)
      .where(eq(portfolioMappingProfiles.id, id))
      .limit(1)
      .execute();
    return profile || null;
  }

  @Post('profiles')
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({
    message: 'Mapping profile created',
    apiCode: 'MAPPING_PROFILE_CREATED',
  })
  async createProfile(@Body() body: { name: string; description?: string; mappings: Record<string, string>; headers: string[] }) {
    const tenantId = TenantContext.tenantId;
    const [profile] = await db
      .insert(portfolioMappingProfiles)
      .values({
        tenantId: tenantId!,
        name: body.name,
        description: body.description || null,
        mappings: body.mappings,
        headers: body.headers,
        fieldCount: Object.keys(body.mappings).length,
      })
      .returning();
    return profile;
  }

  @Put('profiles/:id')
  @Roles('tenant_admin', 'ops')
  @ApiResponseConfig({
    message: 'Mapping profile updated',
    apiCode: 'MAPPING_PROFILE_UPDATED',
  })
  async updateProfile(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; mappings?: Record<string, string>; headers?: string[] },
  ) {
    const updateData: any = { updatedAt: new Date() };
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.mappings) {
      updateData.mappings = body.mappings;
      updateData.fieldCount = Object.keys(body.mappings).length;
    }
    if (body.headers) updateData.headers = body.headers;

    const [updated] = await db
      .update(portfolioMappingProfiles)
      .set(updateData)
      .where(eq(portfolioMappingProfiles.id, id))
      .returning();
    return updated;
  }
}
