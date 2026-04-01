import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as schema from '../libs/drizzle/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('Seeding database...');

  // 1. Seed Platform Admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const [existingAdmin] = await db
    .select()
    .from(schema.platformUsers)
    .where(eq(schema.platformUsers.email, 'admin@cleerio.com'))
    .limit(1);

  if (!existingAdmin) {
    await db.insert(schema.platformUsers).values({
      email: 'admin@cleerio.com',
      name: 'Platform Admin',
      passwordHash,
      role: 'platform_admin',
      status: 'active',
    });
    console.log('Platform admin seeded: admin@cleerio.com / admin123');
  } else {
    console.log('Platform admin already exists.');
  }

  console.log('Seeding completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
