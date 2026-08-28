import { sql } from 'drizzle-orm';
import { client, db } from '$lib/backend/db';

// Vite will bundle these files at build time so they are available in Capacitor
const migrationFiles = import.meta.glob('../../../../drizzle/*.sql', { as: 'raw' });
const journalFile = import.meta.glob('../../../../drizzle/meta/_journal.json', { as: 'raw' });

export async function initLocalDatabase() {
  console.log('⏳ Running local Capacitor database migrations...');

  // 1. Ensure the Drizzle migration table exists
  await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations"
      (
          id         SERIAL PRIMARY KEY,
          hash       text NOT NULL,
          created_at bigint
      )
  `);

  // 2. Load the journal to know the correct order of migrations
  const journalEntries = Object.values(journalFile);
  if (journalEntries.length === 0) throw new Error('No Drizzle journal found');

  const journalRaw = await journalEntries[0]();
  const journal = JSON.parse(journalRaw as string);

  // 3. Apply migrations in order
  for (const entry of journal.entries) {
    const migrationHash = entry.hash;
    const migrationTag = entry.tag; // e.g., 0000_snapshot

    // Check if already applied
    const result = await db.execute(
      sql`SELECT id
          FROM "__drizzle_migrations"
          WHERE hash = ${migrationHash}`
    );

    if (result.rows.length === 0) {
      console.log(`Applying migration: ${migrationTag}...`);

      // Find the matching SQL file
      const sqlFilePath = Object.keys(migrationFiles).find(path => path.includes(migrationTag));
      if (!sqlFilePath) throw new Error(`SQL file for ${migrationTag} not found`);

      const sqlContent = await migrationFiles[sqlFilePath]();

      // Execute the migration SQL
      await client.exec(sqlContent as string);

      // Record it in the migrations table
      await db.execute(sql`
          INSERT INTO "__drizzle_migrations" (hash, created_at)
          VALUES (${migrationHash}, ${Date.now()})
      `);
    }
  }

  // 4. Set up the Roles
  await client.exec(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
          CREATE ROLE app_user;
        END IF;
      END
      $$;

      GRANT USAGE ON SCHEMA public TO app_user;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_user;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_user;
    `);

  console.log('✅ Local database initialized and up to date!');
}
