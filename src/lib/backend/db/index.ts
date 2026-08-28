import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';
import { browser } from '$app/environment';

let dataDir = 'idb://my-app-local-db'; // Default for Capacitor / Offline Mode

// If we are NOT in the browser, we are running on the Node server.
if (!browser) {
  // Dynamically import private envs so Vite strips this from the client bundle
  const { env } = await import('$env/dynamic/private');

  // Use the Docker location or fallback
  dataDir = env.DOCKER_DATABASE_LOCATION || '/data/pglite';
}

export const client = new PGlite(dataDir);
export const db = drizzle(client, { casing: 'snake_case', schema });
