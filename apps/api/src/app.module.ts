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
  WorkflowRulesModule,
  JobsModule,
  RepaymentSyncsModule,
  OptOutModule,
  CommEventsModule,
  BatchRunsModule,
  DeliveryLogsModule,
  ScheduledJobsModule,
  AuditLogsModule,
  ReportJobsModule,
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
    WorkflowRulesModule,
    JobsModule,
    ReportsModule,
    RepaymentSyncsModule,
    OptOutModule,
    CommEventsModule,
    BatchRunsModule,
    DeliveryLogsModule,
    ScheduledJobsModule,
    AuditLogsModule,
    ReportJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
