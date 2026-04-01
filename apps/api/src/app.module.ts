import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantMiddleware } from '@platform/tenant';
import {
  AuthModule,
  TenantsModule,
  TenantFieldRegistryModule,
  PortfoliosModule,
  PortfolioRecordsModule,
  DpdBucketConfigsModule,
  ChannelConfigsModule,
  CommTemplatesModule,
  WorkflowRulesModule,
  JobsModule,
} from '@platform/domain';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    AuthModule,
    TenantsModule,
    TenantFieldRegistryModule,
    PortfoliosModule,
    PortfolioRecordsModule,
    DpdBucketConfigsModule,
    ChannelConfigsModule,
    CommTemplatesModule,
    WorkflowRulesModule,
    JobsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*'); // Apply tenant parsing to all routes
  }
}
