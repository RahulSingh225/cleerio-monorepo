import { Module } from '@nestjs/common';
import { CommTemplatesService } from './comm-templates.service';
import { TemplateRendererService } from './template-renderer.service';

@Module({
  providers: [CommTemplatesService, TemplateRendererService],
  exports: [CommTemplatesService, TemplateRendererService],
})
export class CommTemplatesModule {}
