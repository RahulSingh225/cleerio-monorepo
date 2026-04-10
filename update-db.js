const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('Updating gen_ulid function...');

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    DROP FUNCTION IF EXISTS gen_ulid() CASCADE;

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
