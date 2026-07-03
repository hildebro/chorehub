import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const client = postgres(env.APP_DATABASE_URL || '');
export const db = drizzle(client, { casing: 'snake_case', schema });

const adminClient = postgres(env.DATABASE_URL || '');
export const adminDb = drizzle(adminClient, { casing: 'snake_case', schema });
