import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Updating gen_ulid function...');

  await db.execute(sql`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE OR REPLACE FUNCTION gen_ulid()
    RETURNS uuid
    LANGUAGE plpgsql
    VOLATILE
    AS $$
    DECLARE
        timestamp_ms bigint;
        ulid_bytes bytea;
    BEGIN
        -- Get current timestamp in milliseconds
        timestamp_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint;

        -- Combine 6 bytes of timestamp and 10 bytes of randomness
        ulid_bytes := substring(int8send(timestamp_ms) FROM 3 FOR 6) 
                   || gen_random_bytes(10);

        -- Postgres natively encodes the 16 bytes into hex and cast to uuid
        RETURN encode(ulid_bytes, 'hex')::uuid;
    END;
    $$;
  `);

  console.log('Function updated successfully.');
  process.exit(0);
}

main().catch(console.error);
