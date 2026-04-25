export * from './modules/auth/auth.module';
export * from './modules/auth/auth.service';
export * from './modules/auth/guards/jwt-auth.guard';
export * from './modules/auth/guards/tenant-role.guard';
export * from './modules/auth/decorators/roles.decorator';

export * from './modules/tenants/tenants.module';
export * from './modules/tenants/tenants.service';

export * from './modules/tenant-users/tenant-users.module';
export * from './modules/tenant-users/tenant-users.service';

export * from './modules/tenant-field-registry/tenant-field-registry.module';
export * from './modules/tenant-field-registry/tenant-field-registry.service';

export * from './modules/dpd-bucket-configs/dpd-bucket-configs.module';
export * from './modules/dpd-bucket-configs/dpd-bucket-configs.service';

export * from './modules/channel-configs/channel-configs.module';
export * from './modules/channel-configs/channel-configs.service';
export * from './modules/channel-configs/generic-dispatcher.service';

export * from './modules/comm-templates/comm-templates.module';
export * from './modules/comm-templates/comm-templates.service';
export * from './modules/comm-templates/template-renderer.service';

export * from './modules/portfolios/portfolios.module';
export * from './modules/portfolios/portfolios.service';

export * from './modules/portfolio-records/portfolio-records.module';
export * from './modules/portfolio-records/portfolio-records.service';

export * from './modules/jobs/jobs.module';
export * from './modules/jobs/jobs.service';

export * from './modules/opt-out/opt-out.module';
export * from './modules/opt-out/opt-out.service';

export * from './modules/comm-events/comm-events.module';
export * from './modules/comm-events/comm-events.service';

export * from './modules/delivery-logs/delivery-logs.module';
export * from './modules/delivery-logs/delivery-logs.service';

export * from './modules/audit-logs/audit-logs.module';
export * from './modules/audit-logs/audit-logs.service';

export * from './modules/report-jobs/report-jobs.module';
export * from './modules/report-jobs/report-jobs.service';

// ─── V2 NEW MODULES ─────────────────────────────────────────

export * from './modules/segments/segments.module';
export * from './modules/segments/segments.service';
export * from './modules/segments/reassignment-rules.service';

export * from './modules/segmentation-runs/segmentation-runs.module';
export * from './modules/segmentation-runs/segmentation-runs.service';

export * from './modules/journeys/journeys.module';
export * from './modules/journeys/journeys.service';
export * from './modules/journeys/journey-progression.service';

export * from './modules/journey-steps/journey-steps.service';

export * from './modules/interaction-events/interaction-events.module';
export * from './modules/interaction-events/interaction-events.service';

export * from './modules/repayment/repayment.module';
export * from './modules/repayment/repayment.service';

export * from './modules/repayment-syncs/repayment-syncs.module';
export * from './modules/repayment-syncs/repayment-syncs.service';

export * from './modules/webhooks/webhooks.module';
export * from './modules/webhooks/callback-normalizer.service';
export * from './modules/webhooks/feedback-processor.service';

export * from './modules/data-points/data-points.module';
export * from './modules/data-points/data-points.service';

export * from './modules/payment-links/payment-links.module';
export * from './modules/payment-links/payment-links.service';
