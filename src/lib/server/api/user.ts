import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/server/api/types';
import { logout } from '$lib/server/auth';
import { generateDatabaseBackup } from '$lib/server/db/export'; // <-- Import your new helper
import {
  addUser,
  assertMatchingHousehold,
  assertPermissibleAdminUpdate,
  dismissHelpDisclaimer,
  findHouseholdUsers,
  findUser,
  isUsernameTaken,
  updateDefaultDistribution,
  updateUser
} from '$lib/server/db/functions';
import { z } from '$lib/zod';

const userSchema = z.object({
  id: z.union([z.string().nonempty(), z.null()]),
  householdId: z.string().nonempty(),
  username: z.string().trim().min(3).max(30),
  password: z.union([z.string().min(6).max(64), z.undefined()]),
  serverAdmin: z.boolean().nonoptional(),
  householdAdmin: z.boolean().nonoptional()
});
export type UserPayload = z.infer<typeof userSchema>;

const updateMeSchema = z.object({
  username: z.string().trim().min(3).max(30),
  password: z.union([z.string().min(6).max(64), z.undefined()])
});

const distributionSchema = z.array(
  z.object({
    userId: z.string().nonempty(),
    percent: z.coerce.number().min(0).max(100),
  })
)
  .refine(
    (data) => {
      const total = data.reduce((sum, d) => sum + d.percent, 0);
      return Math.abs(total - 100) < 0.1;
    },
    {
      message: 'balance_expense_distribution_invalid_sum',
      path: ['distributions']
    }
  );

const usersRouter = new Hono<AppEnv>()
  .get('/', async (c) => {
    const user = c.get('loggedInUser');

    return c.json(await findHouseholdUsers(user.householdId));
  })
  .get('/export', async (c) => {
    const { webStream, filename } = generateDatabaseBackup();

    c.header('Content-Type', 'application/gzip');
    c.header('Content-Disposition', `attachment; filename="${filename}"`);

    return c.body(webStream);
  })
  .get('/:id', async (c) => {
    const userId = c.req.param('id');
    const user = await findUser(userId);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const loggedInUser = c.get('loggedInUser');
    if (loggedInUser.serverAdmin) {
      return c.json(user);
    }

    if (loggedInUser.householdAdmin && loggedInUser.householdId === user.householdId) {
      return c.json(user);
    }

    return c.json({ error: 'Unauthorized' }, 403);
  })
  .post('/update', zValidator('json', userSchema), async (c) => {
    const user = c.req.valid('json');

    const loggedInUser = c.get('loggedInUser');
    if (
      !loggedInUser.serverAdmin
      && (!loggedInUser.householdAdmin || loggedInUser.householdId !== user.householdId)
    ) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    if (await isUsernameTaken(user.username, user.householdId, user.id)) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['username'],
          message: 'auth_register_error_taken'
        }
      ]);

      return c.json({ success: false, error }, 400);
    }

    if (!(await assertPermissibleAdminUpdate(user))) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['form'],
          message: 'settings_users_admin_invalid_state'
        }
      ]);

      return c.json({ success: false, error }, 400);
    }

    if (user.id) {
      await updateUser(user.id, user.username, user.password, user.serverAdmin, user.householdAdmin);
    } else {
      if (!user.password) {
        const error = new z.ZodError([
          {
            code: 'custom',
            path: ['password'],
            message: 'form_invalid_nonempty'
          }
        ]);

        return c.json({ success: false, error }, 400);
      }
      await addUser(user.username, user.password as string, user.householdId, user.serverAdmin, user.householdAdmin);
    }

    return c.json({ success: true });
  })
  .post('/update/me', zValidator('json', updateMeSchema), async (c) => {
    const updateData = c.req.valid('json');

    const user = c.get('loggedInUser');

    await updateUser(user.id, updateData.username, updateData.password, user.serverAdmin, user.householdAdmin);

    return c.json({ success: true });
  })
  .post(
    '/distributions',
    zValidator('json', distributionSchema),
    async (c) => {
      const distributions = c.req.valid('json');

      const loggedInUser = c.get('loggedInUser');
      if (!loggedInUser.householdAdmin) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const userIds = distributions.map((distribution) => distribution.userId);
      userIds.push(loggedInUser.id);
      if (!(await assertMatchingHousehold(userIds))) {
        return c.json({ error: 'Household of all users must match your household' }, 400);
      }

      await updateDefaultDistribution(distributions);

      return c.json({ success: true });
    }
  )
  .post('/dismissHelpDisclaimer', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    await dismissHelpDisclaimer(loggedInUser.id);

    return c.json({ success: true });
  })
  .post('/logout', async (c) => {
    await logout(c);

    return c.json({ success: true });
  });

export default usersRouter;
