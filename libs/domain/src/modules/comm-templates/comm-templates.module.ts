import { Module } from '@nestjs/common';
import { CommTemplatesController } from './comm-templates.controller';
import { CommTemplatesService } from './comm-templates.service';
import { TemplateRendererService } from './template-renderer.service';

@Module({
  controllers: [CommTemplatesController],
  providers: [CommTemplatesService, TemplateRendererService],
  exports: [CommTemplatesService, TemplateRendererService],
})
export class CommTemplatesModule {}
