import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantMiddleware } from '@platform/tenant';
import {
  AuthModule,
  TenantsModule,
  TenantUsersModule,
  TenantFieldRegistryModule,
  PortfoliosModule,
  PortfolioRecordsModule,
  DpdBucketConfigsModule,
  ChannelConfigsModule,
  CommTemplatesModule,
  JobsModule,
  OptOutModule,
  CommEventsModule,
  DeliveryLogsModule,
  AuditLogsModule,
  ReportJobsModule,
  // V2 Modules
  SegmentsModule,
  SegmentationRunsModule,
  JourneysModule,
  InteractionEventsModule,
  RepaymentModule,
} from '@platform/domain';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    AuthModule,
    TenantsModule,
    TenantUsersModule,
    TenantFieldRegistryModule,
    PortfoliosModule,
    PortfolioRecordsModule,
    DpdBucketConfigsModule,
    ChannelConfigsModule,
    CommTemplatesModule,
    JobsModule,
    ReportsModule,
    OptOutModule,
    CommEventsModule,
    DeliveryLogsModule,
    AuditLogsModule,
    ReportJobsModule,
    // V2 Modules
    SegmentsModule,
    SegmentationRunsModule,
    JourneysModule,
    InteractionEventsModule,
    RepaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
