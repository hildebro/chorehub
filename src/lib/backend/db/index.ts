import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const dataDir = env.DOCKER_DATABASE_LOCATION || '/data/pglite';

export const client = new PGlite(dataDir);
export const db = drizzle(client, { casing: 'snake_case', schema });
