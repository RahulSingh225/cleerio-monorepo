import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantMiddleware } from '@platform/tenant';
import { AuthModule } from './auth/auth.module';
import { TenantFieldRegistryModule } from './tenant-field-registry/tenant-field-registry.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { PortfolioRecordsModule } from './portfolio-records/portfolio-records.module';
import { DpdBucketConfigsModule } from './dpd-bucket-configs/dpd-bucket-configs.module';
import { ChannelConfigsModule } from './channel-configs/channel-configs.module';
import { CommTemplatesModule } from './comm-templates/comm-templates.module';
import { WorkflowRulesModule } from './workflow-rules/workflow-rules.module';

@Module({
  imports: [
    AuthModule,
    TenantFieldRegistryModule,
    PortfoliosModule,
    PortfolioRecordsModule,
    DpdBucketConfigsModule,
    ChannelConfigsModule,
    CommTemplatesModule,
    WorkflowRulesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*'); // Apply tenant parsing to all routes
  }
}
