import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';
import { browser } from '$app/environment';

let dataDir = 'idb://my-app-local-db'; // Default for Capacitor / Local-Only Mode

if (!browser) {
  const dockerLocation = typeof process !== 'undefined' && process.env
    ? process.env.DOCKER_DATABASE_LOCATION
    : undefined;

  dataDir = dockerLocation || '/data/pglite';
}

export const client = new PGlite(dataDir);
export const db = drizzle(client, { casing: 'snake_case', schema });
