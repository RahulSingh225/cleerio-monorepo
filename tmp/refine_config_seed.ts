import { db } from '../libs/drizzle/db';
import { tenants, tenantFieldRegistry, dpdBucketConfigs } from '../libs/drizzle/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.code, 'REFINE')).limit(1);
  if (!tenant) {
    console.error('Tenant REFINE not found. Please seed the tenant first.');
    return;
  }

  console.log('Using Tenant ID:', tenant.id);

  // 1. Field Mappings
  const mappings = [
    { header: 'userid', label: 'userId', type: 'string', isCore: true },
    { header: 'Name', label: 'name', type: 'string', isCore: true },
    { header: 'Mobile Number', label: 'mobile', type: 'string', isCore: true },
    { header: 'product', label: 'product', type: 'string', isCore: true },
    { header: 'current_dpd', label: 'currentDpd', type: 'number', isCore: true },
    { header: 'over_due', label: 'overdue', type: 'number', isCore: false },
    { header: 'outstandings', label: 'outstanding', type: 'number', isCore: true },
  ];

  for (let i = 0; i < mappings.length; i++) {
    const m = mappings[i];
    await db.insert(tenantFieldRegistry).values({
      tenantId: tenant.id,
      fieldKey: `field${i + 1}`,
      fieldIndex: i,
      headerName: m.header,
      displayLabel: m.label,
      dataType: m.type,
      isCore: m.isCore,
    }).onConflictDoNothing();
  }
  console.log('✅ Field mappings seeded.');

  // 2. DPD Buckets
  const buckets = [
    { name: 'Bucket 0', min: 0, max: 0, label: 'Current' },
    { name: 'Bucket 1', min: 1, max: 30, label: '1-30 DPD' },
    { name: 'Bucket 2', min: 31, max: 60, label: '31-60 DPD' },
    { name: 'Bucket 3', min: 61, max: 90, label: '61-90 DPD' },
    { name: 'Bucket 4', min: 91, max: 120, label: '91-120 DPD' },
    { name: 'Bucket >120', min: 121, max: 9999, label: '120+ DPD' },
  ];

  for (const b of buckets) {
    await db.insert(dpdBucketConfigs).values({
      tenantId: tenant.id,
      bucketName: b.name,
      dpdMin: b.min,
      dpdMax: b.max,
      displayLabel: b.label,
      priority: 1,
      isActive: true,
    }).onConflictDoNothing();
  }
  console.log('✅ DPD Buckets seeded.');
}

seed().catch(console.error);
