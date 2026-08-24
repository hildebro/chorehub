import { migrate } from 'drizzle-orm/pglite/migrator';
import { db } from '$lib/server/db';

export async function handle({ event, resolve }) {
  if (import.meta.env.DEV || import.meta.env.VITE_RUN_MIGRATIONS !== 'false') {
    try {
      // Drizzle handles reading the folder and tracking applied migrations automatically
      await migrate(db, { migrationsFolder: 'drizzle' });
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Failed to run migrations:', error);
      throw error;
    }
  }

  return resolve(event);
}
