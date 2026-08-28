import { type ExtractTablesWithRelations, sql } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { browser } from '$app/environment';
import type * as schema from '$lib/backend/db/schema';

// Define the type for the value stored in the context (our transactional client)
type TransactionalDbClient = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

// 1. Create a lightweight, browser-safe fallback for Capacitor
class BrowserALS<T> {
  private store: T | undefined;

  getStore(): T | undefined {
    return this.store;
  }

  run<R>(store: T, callback: () => R): R {
    const previousStore = this.store;
    this.store = store;
    try {
      return callback();
    } finally {
      this.store = previousStore;
    }
  }
}

// 2. Define a common interface so TypeScript knows what methods exist
interface IAsyncLocalStorage<T> {
  getStore(): T | undefined;

  run<R>(store: T, callback: () => R): R;
}

// 3. Dynamically assign the correct implementation
let ALS: new <T>() => IAsyncLocalStorage<T>;

if (browser) {
  // Use the local polyfill for the mobile app
  ALS = BrowserALS;
} else {
  // Dynamic import prevents Rollup from throwing a named-export error on client build
  const asyncHooks = await import('node:async_hooks');
  ALS = asyncHooks.AsyncLocalStorage;
}

// Create the AsyncLocalStorage instance using our dynamically resolved class
export const transactionContext = new ALS<TransactionalDbClient>();

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
