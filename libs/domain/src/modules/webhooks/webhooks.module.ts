import { Module } from '@nestjs/common';
import { CallbackNormalizerService } from './callback-normalizer.service';
import { FeedbackProcessorService } from './feedback-processor.service';

import { SegmentsModule } from '../segments/segments.module';

@Module({
  imports: [SegmentsModule],
  providers: [CallbackNormalizerService, FeedbackProcessorService],
  exports: [CallbackNormalizerService, FeedbackProcessorService],
})
export class WebhooksModule {}
