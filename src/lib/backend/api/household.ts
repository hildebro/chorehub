import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/backend/api/types';
import { addHousehold, findAllHouseholds, findHousehold, updateHousehold } from '$lib/backend/db/functions';
import { Admin } from '$lib/utils/userHelper';
import { z } from '$lib/zod';

const createHouseholdSchema = z.object({
  name: z.string().nonempty()
});

const updateHouseholdSchema = createHouseholdSchema.extend({
  id: z.string().min(1)
});

const householdRouter = new Hono<AppEnv>()
  .get('/', async (c) => {
    const loggedInUser = c.get('loggedInUser');
    if (loggedInUser.admin === Admin.Server) {
      return c.json(await findAllHouseholds());
    }

    if (loggedInUser.admin === Admin.Household) {
      const household = await findHousehold(loggedInUser.householdId);
      if (!household) {
        return c.json({ error: 'Logged-in user has no valid household' }, 500);
      }

      return c.json([household]);
    }

    return c.json({ error: 'Unauthorized' }, 403);
  })
  .get('/:id', async (c) => {
    const loggedInUser = c.get('loggedInUser');
    const householdId = c.req.param('id');

    if (
      loggedInUser.admin === Admin.None
      || (loggedInUser.admin === Admin.Household && loggedInUser.householdId !== householdId)
    ) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const household = await findHousehold(householdId);
    if (!household) {
      return c.json({ error: 'Household not found' }, 404);
    }

    return c.json(household);
  })
  .post(
    '/',
    zValidator('json', createHouseholdSchema),
    async (c) => {
      const loggedInUser = c.get('loggedInUser');
      if (loggedInUser.admin !== Admin.Server) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const household = c.req.valid('json');
      await addHousehold(household.name);

      return c.json({ success: true });
    })
  .patch(
    '/',
    zValidator('json', updateHouseholdSchema),
    async (c) => {
      const loggedInUser = c.get('loggedInUser');
      if (loggedInUser.admin !== Admin.Server) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const household = c.req.valid('json');
      await updateHousehold(household.id, household.name);

      return c.json({ success: true });
    });

export default householdRouter;
