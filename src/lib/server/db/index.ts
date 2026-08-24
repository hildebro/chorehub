import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const dataDir = env.PG_LITE_DATA_DIR || '/data/pglite';

// 1. Create exactly ONE PGlite instance per data directory
export const client = new PGlite(dataDir);
export const db = drizzle(client, { casing: 'snake_case', schema });

// 2. Reuse the exact same client for the admin DB
export const adminDb = drizzle(client, { casing: 'snake_case', schema });
