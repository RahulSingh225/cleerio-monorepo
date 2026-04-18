import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import path from 'path';

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool);

  console.log('⏳ Running migrations...');

  const start = Date.now();

  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../drizzle/migrations'),
    });
    const end = Date.now();
    console.log(`✅ Migrations completed in ${end - start}ms`);
  } catch (err) {
    console.error('❌ Migration failed');
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
