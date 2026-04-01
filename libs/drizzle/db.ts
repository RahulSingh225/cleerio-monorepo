import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from the root of the monorepo
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
// Also try the local .env if cwd is the root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool;

// Ensure we don't create multiple pools in development (e.g. Next.js HMR or NestJS reloading)
if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  if (!(global as any).pgPool) {
    (global as any).pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = (global as any).pgPool;
}

export const db = drizzle(pool, { schema });

// Export the types for reuse
export type Database = typeof db;
