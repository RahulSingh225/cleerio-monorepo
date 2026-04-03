import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { CommEventsService } from './comm-events.service';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { eq } from 'drizzle-orm';
import { commEvents } from '@platform/drizzle';

@Controller('comm-events')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CommEventsController {
  constructor(private readonly service: CommEventsService) {}

  @Get()
  @ApiResponseConfig({ message: 'Communication events listed', apiCode: 'COMM_EVENTS_LISTED' })
  async findAll(@Query('status') status?: string, @Query('channel') channel?: string) {
    return this.service.findAllForTenant({ status, channel });
  }

  @Get(':id')
  @ApiResponseConfig({ message: 'Communication event retrieved', apiCode: 'COMM_EVENT_RETRIEVED' })
  async findOne(@Param('id') id: string) {
    return this.service.findFirst(eq(commEvents.id, id));
  }

  @Get('record/:recordId')
  @ApiResponseConfig({ message: 'Record events retrieved', apiCode: 'RECORD_EVENTS_RETRIEVED' })
  async findByRecord(@Param('recordId') recordId: string) {
    return this.service.findByRecord(recordId);
  }

  @Put(':id/cancel')
  @ApiResponseConfig({ message: 'Communication event cancelled', apiCode: 'COMM_EVENT_CANCELLED' })
  async cancel(@Param('id') id: string) {
    return this.service.cancelEvent(id);
  }
}
