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
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS dispatch_api_template JSONB DEFAULT '{}';`);
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS provider_name VARCHAR(50);`);
    await db.execute(sql`ALTER TABLE channel_configs ADD COLUMN IF NOT EXISTS provider_config JSONB DEFAULT '{}';`);
    return { success: true, message: 'channel_configs altered successfully' };
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
