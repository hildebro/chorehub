import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import {
  addBalanceEntry,
  calculateUserDebts,
  findAllBalanceEntries,
  findBalanceEntry,
  updateBalanceEntry
} from '$lib/backend/db/functions';
import { z } from '$lib/zod';

const baseExpenseSchema = z.object({
  purchaseId: z.transform((val) => (val !== '' ? val : null)).pipe(z.string().nullable()),
  name: z.string().min(1),
  creditorId: z.string().min(1),
  price: z.coerce.number().min(0.01),
  distributions: z.array(z.object({ userId: z.string().nonempty(), percent: z.coerce.number().min(0) }))
});

const distributionValidation = (data: { distributions: { percent: number }[] }) => {
  const total = data.distributions.reduce((sum, d) => sum + d.percent, 0);
  return Math.abs(total - 100) < 0.1;
};

const distributionValidationMessage = {
  message: 'balance_expense_distribution_invalid_sum',
  path: ['distributions']
};

const createExpenseSchema = baseExpenseSchema
  .refine(distributionValidation, distributionValidationMessage);

const updateExpenseSchema = baseExpenseSchema
  .extend({ id: z.string().min(1) })
  .refine(distributionValidation, distributionValidationMessage);

const balanceRouter = new Hono()
  .get('/', async (c) => {
    return c.json(await findAllBalanceEntries());
  })
  .get('/debts', async (c) => {
    return c.json(await calculateUserDebts());
  })
  .get('/:entry', async (c) => {
    const entryParam = c.req.param('entry');
    const entry = await findBalanceEntry(entryParam);
    if (!entry) return c.json({ error: 'Entry not found' }, 404);

    return c.json(entry);
  })
  .post(
    '/',
    zValidator('json', createExpenseSchema),
    async (c) => {
      const expense = c.req.valid('json');
      await addBalanceEntry(
        expense.creditorId,
        expense.name,
        expense.price,
        expense.distributions,
        expense.purchaseId
      );
      return c.json({ success: true });
    }
  )
  .patch(
    '/',
    zValidator('json', updateExpenseSchema),
    async (c) => {
      const expense = c.req.valid('json');
      await updateBalanceEntry(
        expense.id,
        expense.creditorId,
        expense.name,
        expense.price,
        expense.distributions
      );
      return c.json({ success: true });
    }
  );

export default balanceRouter;
