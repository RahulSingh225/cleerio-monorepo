import { Controller, Post, Body, Get, UseGuards, Put, Param } from '@nestjs/common';
import { DpdBucketConfigsService } from './dpd-bucket-configs.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantGuard } from '@platform/tenant';
import { eq } from 'drizzle-orm';
import { dpdBucketConfigs } from '@platform/drizzle';

@Controller('dpd-bucket-configs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DpdBucketConfigsController {
  constructor(private readonly bucketService: DpdBucketConfigsService) {}

  @Post()
  @Roles('tenant_admin')
  @ApiResponseConfig({
    message: 'DPD Bucket successfully created',
    apiCode: 'BUCKET_CREATED',
  })
  async create(@Body() createBucketDto: CreateBucketDto) {
    return this.bucketService.insert(createBucketDto);
  }

  @Get()
  @ApiResponseConfig({
    message: 'DPD Buckets retrieved successfully',
    apiCode: 'BUCKETS_RETRIEVED',
  })
  async findAll() {
    return this.bucketService.findMany();
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiResponseConfig({
    message: 'DPD Bucket updated successfully',
    apiCode: 'BUCKET_UPDATED',
  })
  async update(@Param('id') id: string, @Body() data: Partial<CreateBucketDto>) {
      // eq filter handles the specific UUID lookup
      return this.bucketService.update(eq(dpdBucketConfigs.id, id), data);
  }
}
