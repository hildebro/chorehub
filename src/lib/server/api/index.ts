import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { transactionContext, getTx } from '$lib/context';
import balanceRouter from '$lib/server/api/balance';
import householdRouter from '$lib/server/api/household';
import publicRouter from '$lib/server/api/public';
import shoppingRouter from '$lib/server/api/shopping';
import tasksRouter from '$lib/server/api/task';
import type { AppEnv } from '$lib/server/api/types';
import usersRouter from '$lib/server/api/user';
import { getLoggedInUser } from '$lib/server/auth';
import { db } from '$lib/server/db';

const app = new Hono<AppEnv>().basePath('/api');

// Cors settings for capacitor
app.use('*', cors({
  origin: ['capacitor://localhost', 'http://localhost', 'https://localhost'],
  allowMethods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['x-refreshed-token']
}));

// Database Transaction
app.use('*', async (_c, next) => {
  // Start the Drizzle transaction using the main db client
  await db.transaction(async (tx) => {
    // Run the downstream Hono routes within the ALS context
    await transactionContext.run(tx, async () => {
      await next();
    });
  });
});

// Authentication + context injection
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api/public')) {
    return await next();
  }

  const user = await getLoggedInUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const tx = getTx();

  // Inject the household ID and downgrade the role in the current Postgres transaction
  await tx.execute(sql`SET LOCAL ROLE app_user`);
  await tx.execute(
    sql`SELECT set_config('app.current_household_id', ${user.householdId}, true)`
  );

  c.set('loggedInUser', user);

  await next();
});

// Technically unused, but this definition is required for the routes to be available.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route('/tasks', tasksRouter)
  .route('/households', householdRouter)
  .route('/users', usersRouter)
  .route('/shopping', shoppingRouter)
  .route('/balance', balanceRouter)
  .route('/public', publicRouter);

export type AppType = typeof routes;

export default app;
