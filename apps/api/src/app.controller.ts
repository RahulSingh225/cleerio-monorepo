import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

import { db, tenants, segments, commTemplates, journeys, journeySteps } from '@platform/drizzle';
import { sql } from 'drizzle-orm';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('migrate')
  async migrate() {
    // ── Phase 5.0: Portfolio Data Foundation ──
    // Promoted core columns from stakeholder docs
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS loan_number VARCHAR(100);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS due_date DATE;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS emi_amount NUMERIC(14,2);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS language VARCHAR(20);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS state VARCHAR(100);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS city VARCHAR(100);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS cibil_score INTEGER;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS salary_date INTEGER;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS enach_enabled BOOLEAN;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS alternate_numbers JSONB DEFAULT '[]';`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS loan_amount NUMERIC(14,2);`);
    // Rename employer_id → employer_name (safe: add new, keep old)
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS employer_name VARCHAR(255);`);

    // ── Phase 5.1: Feedback columns ──
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS last_contacted_channel VARCHAR(20);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS last_delivery_status VARCHAR(30);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS last_interaction_type VARCHAR(50);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS ptp_date DATE;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS ptp_amount NUMERIC(14,2);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS ptp_status VARCHAR(20);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS contactability_score INTEGER DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS preferred_channel VARCHAR(20);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS total_comm_attempts INTEGER DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS total_comm_delivered INTEGER DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS total_comm_read INTEGER DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS total_comm_replied INTEGER DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS risk_bucket VARCHAR(20);`);
    await db.execute(sql`ALTER TABLE portfolio_records ADD COLUMN IF NOT EXISTS feedback_summary JSONB DEFAULT '{}';`);

    // Indexes for new core + feedback columns
    await db.execute(sql`CREATE INDEX IF NOT EXISTS portfolio_records_tenant_state_idx ON portfolio_records(tenant_id, state);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS portfolio_records_tenant_cibil_idx ON portfolio_records(tenant_id, cibil_score);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS portfolio_records_tenant_due_date_idx ON portfolio_records(tenant_id, due_date);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS portfolio_records_tenant_loan_number_idx ON portfolio_records(tenant_id, loan_number);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS portfolio_records_tenant_email_idx ON portfolio_records(tenant_id, email);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS portfolio_records_tenant_contactability_idx ON portfolio_records(tenant_id, contactability_score);`);

    // ── Delivery logs enhancements ──
    await db.execute(sql`ALTER TABLE delivery_logs ADD COLUMN IF NOT EXISTS failure_reason VARCHAR(100);`);
    await db.execute(sql`ALTER TABLE delivery_logs ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;`);
    await db.execute(sql`ALTER TABLE delivery_logs ADD COLUMN IF NOT EXISTS reply_content TEXT;`);
    await db.execute(sql`ALTER TABLE delivery_logs ADD COLUMN IF NOT EXISTS link_clicked BOOLEAN DEFAULT false;`);
    await db.execute(sql`ALTER TABLE delivery_logs ADD COLUMN IF NOT EXISTS link_clicked_at TIMESTAMPTZ;`);

    // ── Channel configs enhancements ──
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS dispatch_api_template JSONB DEFAULT '{}';`);
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS provider_name VARCHAR(50);`);
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS provider_config JSONB DEFAULT '{}';`);
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS callback_url TEXT;`);
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS callback_secret VARCHAR(255);`);
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS callback_payload_map JSONB DEFAULT '{}';`);

    // ── Tenant field registry enhancements ──
    await db.execute(sql`ALTER TABLE tenant_field_registry ADD COLUMN IF NOT EXISTS is_strategic BOOLEAN DEFAULT false;`);
    await db.execute(sql`ALTER TABLE tenant_field_registry ADD COLUMN IF NOT EXISTS semantic_role VARCHAR(50);`);

    // ── Portfolio configs table (allocation checklist) ──
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS portfolio_configs (
        id UUID PRIMARY KEY DEFAULT gen_ulid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        portfolio_id UUID REFERENCES portfolios(id),
        lender_name VARCHAR(255),
        total_book_size NUMERIC(14,2),
        secured_unsecured_split VARCHAR(20),
        primary_products JSONB DEFAULT '[]',
        monthly_inflow NUMERIC(14,2),
        current_dpd_stock NUMERIC(14,2),
        current_efficiency NUMERIC(5,2),
        target_efficiency NUMERIC(5,2),
        target_ror NUMERIC(5,2),
        current_contactability NUMERIC(5,2),
        approved_channels JSONB DEFAULT '[]',
        allocation_start_date DATE,
        allocation_end_date DATE,
        paid_file_frequency VARCHAR(20),
        waiver_grid JSONB DEFAULT '{}',
        current_acr NUMERIC(8,2),
        commercials_model VARCHAR(50),
        reporting_frequency VARCHAR(20),
        expected_region_split JSONB DEFAULT '{}',
        stakeholder_goals JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS portfolio_configs_tenant_id_idx ON portfolio_configs(tenant_id);`);

    return { success: true, message: 'Phase 5.0 + 5.1 migration completed successfully' };
  }

  @Get('seed-journey')
  async seedJourney() {
    const tenantList = await db.select().from(tenants).limit(1);
    const tenant = tenantList[0];
    if (!tenant) return { error: 'No tenant found' };

    // 1. Create a Segment
    const segmentList = await db.insert(segments).values({
      tenantId: tenant.id,
      name: 'High Risk Late Stage (Seeded)',
      code: 'high_risk_late_seeded',
      description: 'Records severely past due',
      criteriaJsonb: [{ field: 'dpd', operator: '>=', value: 30 }],
      isActive: true,
    }).returning();
    const segment = segmentList[0];

    // 2. Create Templates
    const smsTemplateList = await db.insert(commTemplates).values({
      tenantId: tenant.id,
      name: 'Urgent SMS Reminder',
      channel: 'sms',
      body: 'Urgent: Your account {{account_number}} is severely past due. Pay {{outstanding}} immediately.',
      variables: ['account_number', 'outstanding']
    }).returning();
    const smsTemplate = smsTemplateList[0];

    const waTemplateList = await db.insert(commTemplates).values({
      tenantId: tenant.id,
      name: 'WhatsApp Legal Notice',
      channel: 'whatsapp',
      body: 'Official Notice: Action required on account {{account_number}}.',
      variables: ['account_number']
    }).returning();
    const waTemplate = waTemplateList[0];

    // 3. Create Journey
    const journeyList = await db.insert(journeys).values({
      tenantId: tenant.id,
      segmentId: segment.id,
      name: 'Platinum Tier Escalation Journey',
      description: 'Multilayered path executing 6 distinct nodes starting tomorrow 6 PM',
      isActive: true,
    }).returning();
    const journey = journeyList[0];

    // 4. Create Complex Journey Steps
    // Assuming today 3 AM, tomorrow 6 PM is ~39 hours delay. We'll use 39 for the first wait.
    await db.insert(journeySteps).values([
      {
        journeyId: journey.id,
        stepOrder: 1,
        actionType: 'wait',
        delayHours: 39,
      },
      {
        journeyId: journey.id,
        stepOrder: 2,
        actionType: 'send_sms',
        channel: 'sms',
        templateId: smsTemplate.id,
      },
      {
        journeyId: journey.id,
        stepOrder: 3,
        actionType: 'wait',
        delayHours: 48,
      },
      {
        journeyId: journey.id,
        stepOrder: 4,
        actionType: 'condition_check',
        conditionsJsonb: { operator: 'AND', rules: [{ field: 'status', operator: '!=', value: 'paid' }] },
      },
      {
        journeyId: journey.id,
        stepOrder: 5,
        actionType: 'send_whatsapp',
        channel: 'whatsapp',
        templateId: waTemplate.id,
      },
      {
        journeyId: journey.id,
        stepOrder: 6,
        actionType: 'manual_review',
        delayHours: 0,
      }
    ]);

    return { success: true, message: 'Complex multilayered journey seeded successfully! Check the dashboard.' };
  }
}
