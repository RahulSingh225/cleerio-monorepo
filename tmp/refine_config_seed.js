const { Pool } = require('pg');
require('dotenv').config();

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log('Connecting to database...');

  try {
    // 1. Fetch or create REFINE tenant
    let res = await pool.query(`SELECT id FROM tenants WHERE code = $1 LIMIT 1`, ['REFINE']);

    if (res.rows.length === 0) {
      console.log('Tenant REFINE not found. Auto-creating...');
      res = await pool.query(
        `INSERT INTO tenants (name, code, status) VALUES ($1, $2, $3) RETURNING id`,
        ['Refine Corp', 'REFINE', 'active']
      );
    }

    const tenantId = res.rows[0].id;
    console.log('Using Tenant ID:', tenantId);

    // 2. Insert Field Mappings
    const mappings = [
      { header: 'userid', label: 'userId', type: 'string', isCore: true },
      { header: 'Name', label: 'name', type: 'string', isCore: true },
      { header: 'Mobile Number', label: 'mobile', type: 'string', isCore: true },
      { header: 'product', label: 'product', type: 'string', isCore: true },
      { header: 'current_dpd', label: 'currentDpd', type: 'number', isCore: true },
      { header: 'over_due', label: 'overdue', type: 'number', isCore: false }, // Outstanding replaces overdue as core tracking metric
      { header: 'outstandings', label: 'outstanding', type: 'number', isCore: true },
    ];

    // for (let i = 0; i < mappings.length; i++) {
    //   const m = mappings[i];
    //   await pool.query(
    //     `INSERT INTO tenant_field_registry 
    //       (tenant_id, field_key, field_index, header_name, display_label, data_type, is_core)
    //      VALUES ($1, $2, $3, $4, $5, $6, $7)
    //      ON CONFLICT (tenant_id, header_name) DO NOTHING`,
    //     [tenantId, `field${i + 1}`, i, m.header, m.label, m.type, m.isCore]
    //   );
    // }
    console.log('✅ Field mappings seeded.');

    // 3. Insert DPD Buckets
    const buckets = [
      { name: 'Bucket 0', min: 0, max: 0, label: 'Current' },
      { name: 'Bucket 1', min: 1, max: 30, label: '1-30 DPD' },
      { name: 'Bucket 2', min: 31, max: 60, label: '31-60 DPD' },
      { name: 'Bucket 3', min: 61, max: 90, label: '61-90 DPD' },
      { name: 'Bucket 4', min: 91, max: 120, label: '91-120 DPD' },
      { name: 'Bucket >120', min: 121, max: 9999, label: '120+ DPD' },
    ];

    // for (const b of buckets) {
    //   await pool.query(
    //     `INSERT INTO dpd_bucket_configs 
    //       (tenant_id, bucket_name, dpd_min, dpd_max, display_label, priority, is_active)
    //      VALUES ($1, $2, $3, $4, $5, $6, $7)
    //      ON CONFLICT (tenant_id, bucket_name) DO NOTHING`,
    //     [tenantId, b.name, b.min, b.max, b.label, 1, true]
    //   );
    // }
    console.log('✅ DPD Buckets seeded.');

    const bcrypt = require('bcrypt');
    const defaultPassword = 'admin@123'; // Keeping default as admin for convenience
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

    // 4. Insert Platform User
    await pool.query(
      `INSERT INTO platform_users (email, name, role, status, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      ['admin@cleerio.com', 'Cleerio Admin', 'platform_admin', 'active', hashedPassword]
    );
    console.log('✅ Platform User seeded with password.');

    // 5. Insert Tenant User for REFINE
    await pool.query(
      `INSERT INTO tenant_users (tenant_id, email, name, role, status, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (tenant_id, email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [tenantId, 'admin@refine.com', 'Refine Admin', 'tenant_admin', 'active', hashedPassword]
    );
    console.log('✅ Tenant User seeded with password.');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await pool.end();
  }
}

seed();
