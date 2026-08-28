import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

const dataDir = process.env.DOCKER_DATABASE_LOCATION || '/data/pglite';

async function run() {
  console.log(`⏳ Running migrations on database at ${dataDir}...`);

  // Initialize minimal client just for migrations
  const client = new PGlite(dataDir);
  const db = drizzle(client, { casing: 'snake_case' });

  await migrate(db, { migrationsFolder: 'drizzle' });

  await client.exec(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user;
      END IF;
    END
    $$;

    -- Grant basic access to the schema
    GRANT USAGE ON SCHEMA public TO app_user;

    -- Grant access to all existing tables and sequences
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

    -- CRITICAL: Automatically grant permissions for any FUTURE tables/sequences you add later
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_user;
  `);

  console.log('✅ Migrations complete!');

  await client.close();

  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1); // Fails the container startup if migrations break
});
