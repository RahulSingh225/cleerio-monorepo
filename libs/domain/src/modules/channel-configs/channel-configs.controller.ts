import { Controller, Get, Post, Body, UseGuards, Put, Param } from '@nestjs/common';
import { ChannelConfigsService } from './channel-configs.service';
import { UpdateChannelConfigDto } from './dto/update-channel-config.dto';
import { CreateChannelConfigDto } from './dto/create-channel-config.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantGuard } from '@platform/tenant';
import { eq, and } from 'drizzle-orm';
import { channelConfigs } from '@platform/drizzle';

@Controller('channel-configs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ChannelConfigsController {
  constructor(private readonly channelService: ChannelConfigsService) {}

  @Post()
  @Roles('tenant_admin')
  @ApiResponseConfig({
    message: 'Channel configuration created successfully',
    apiCode: 'CHANNEL_CREATED',
  })
  async create(@Body() createDto: CreateChannelConfigDto) {
    return this.channelService.insert(createDto);
  }

  @Get()
  @ApiResponseConfig({
    message: 'Channel configurations retrieved successfully',
    apiCode: 'CHANNELS_RETRIEVED',
  })
  async findAll() {
    return this.channelService.findMany();
  }

  @Put(':channel')
  @Roles('tenant_admin')
  @ApiResponseConfig({
    message: 'Channel configuration updated successfully',
    apiCode: 'CHANNEL_UPDATED',
  })
  async update(
    @Param('channel') channel: string,
    @Body() updateDto: UpdateChannelConfigDto,
  ) {
    // Note: withTenant already injects tenantId filter via BaseRepository.update
    return this.channelService.update(
        eq(channelConfigs.channel, channel),
        updateDto
    );
  }
}
