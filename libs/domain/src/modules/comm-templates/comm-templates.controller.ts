import { Controller, Post, Body, Get, UseGuards, Put, Param, Delete } from '@nestjs/common';
import { CommTemplatesService } from './comm-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { eq } from 'drizzle-orm';
import { commTemplates } from '@platform/drizzle';

@Controller('comm-templates')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CommTemplatesController {
  constructor(private readonly templateService: CommTemplatesService) {}

  @Post()
  @ApiResponseConfig({
    message: 'Communication template created successfully',
    apiCode: 'TEMPLATE_CREATED',
  })
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templateService.insert(createTemplateDto);
  }

  @Get()
  @ApiResponseConfig({
    message: 'Communication templates listed successfully',
    apiCode: 'TEMPLATES_LISTED',
  })
  async findAll() {
    return this.templateService.findMany();
  }

  @Get(':id')
  @ApiResponseConfig({
    message: 'Template details retrieved successfully',
    apiCode: 'TEMPLATE_RETRIEVED',
  })
  async findOne(@Param('id') id: string) {
    return this.templateService.findFirst(eq(commTemplates.id, id));
  }

  @Delete(':id')
  @ApiResponseConfig({
    message: 'Template deleted successfully',
    apiCode: 'TEMPLATE_DELETED',
  })
  async delete(@Param('id') id: string) {
    return this.templateService.delete(eq(commTemplates.id, id));
  }
}
