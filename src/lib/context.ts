import { type ExtractTablesWithRelations, sql } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { AsyncLocalStorage } from 'node:async_hooks';
import type * as schema from '$lib/backend/db/schema';

// Define the type for the value stored in the context (our transactional client)
type TransactionalDbClient = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

// Create the AsyncLocalStorage instance
// This will hold the transactional DB client for the current request
export const transactionContext = new AsyncLocalStorage<TransactionalDbClient>();

// Helper function to safely get the transaction client from the context
export function getTx(): TransactionalDbClient {
  const tx = transactionContext.getStore();
  if (!tx) {
    // This error would typically mean getTx() was called outside the context
    // of a request wrapped by the hook, or before the hook ran.
    throw new Error(
      'Database transaction context is not available. Ensure this function runs within a request handled by the transaction hook.'
    );
  }

  return tx;
}

export async function getAdminTx(): Promise<TransactionalDbClient> {
  const tx = getTx();

  await tx.execute(sql`RESET ROLE`);
  await tx.execute(sql`SET LOCAL row_security = 'off'`);

  return tx;
}
