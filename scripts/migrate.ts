import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

const dataDir = process.env.PG_LITE_DATA_DIR || '/data/pglite';

async function run() {
  console.log(`⏳ Running migrations on database at ${dataDir}...`);

  // Initialize minimal client just for migrations
  const client = new PGlite(dataDir);
  const db = drizzle(client, { casing: 'snake_case' });

  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log('✅ Migrations complete!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1); // Fails the container startup if migrations break
});
