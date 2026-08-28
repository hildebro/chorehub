import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { AppEnv } from '$lib/backend/api/types';
import {
  addShoppingCategory,
  addStagedShoppingList,
  assignCategoryToShoppingItems,
  assignCategoryToStagedItems,
  categorizationFinished,
  commitStagedItems,
  countActiveShoppingItems,
  createShoppingPurchase,
  deactivateShoppingItems,
  deleteCategory,
  deleteShoppingItems,
  deleteStagedList,
  fetchLastPurchaseDate,
  findActiveItemsByCategory,
  findAllPurchases,
  findAllShoppingCategories,
  findAllShoppingItems,
  findShoppingCategory,
  findStagedShoppingList,
  getItemAddSuggestions,
  moveCategoryOrderDown,
  moveCategoryOrderUp,
  stagePurchaseItem,
  unstagePurchaseItem,
  updateShoppingCategory
} from '$lib/backend/db/functions';
import * as m from '$lib/paraglide/messages.js';
import { z } from '$lib/zod';

const setCategorySchema = z.object({
  categoryId: z.string().nonempty(),
  itemIds: z.array(z.string()).nonempty()
});

const itemActionSchema = z.object({
  itemIds: z.array(z.string()).nonempty()
});

const categoryActionSchema = z.object({
  categoryId: z.string().nonempty()
});

const categorySchema = z.object({
  id: z.union([z.string().nonempty(), z.null()]),
  name: z.string().nonempty()
});

const itemsSchema = z.array(z.object({
  amount: z.string().trim(),
  name: z.string().trim()
}))
  .transform((data) => {
    return data
      .filter(item => item.name.length > 0);
  })
  .refine(
    (data) => {
      return data.length > 0;
    },
    {
      message: 'shopping_add_items_empty',
      path: ['form']
    }
  );

const categorizeItemSchema = z.object({
  itemIds: z.array(z.string().nonoptional()).nonempty(m.shopping_categorize_select_items_invalid()),
  categoryId: z.string().nonoptional()
});

const stagingItemSchema = z.object({
  itemId: z.string().nonempty()
})

const shoppingRouter = new Hono<AppEnv>()
  .get('/activeCount', async (c) => {
    return c.json(await countActiveShoppingItems());
  })
  .get('/lastPurchaseDate', async (c) => {
    return c.json(await fetchLastPurchaseDate());
  })
  .get('/hasNoCategories', async (c) => {
    const categories = await findAllShoppingCategories();

    return c.json(categories.length === 0);
  })
  .post('/category', zValidator('json', categorySchema), async (c) => {
    const category = c.req.valid('json');

    if (!category.id) {
      await addShoppingCategory(category.name);
    } else {
      await updateShoppingCategory(category.id, category.name);
    }

    return c.json(category);
  })
  .delete('/category/:id', async (c) => {
    const categoryId = c.req.param('id');
    const category = await findShoppingCategory(categoryId);
    if (!category) {
      return c.json({ error: m.error_category_not_found() }, 404);
    }

    if (category.shoppingItems.length > 0) {
      const error = new z.ZodError([
        {
          code: 'custom',
          path: ['form'],
          message: 'settings_categories_delete_invalid'
        }
      ]);

      return c.json({ success: false, error }, 400);
    }

    await deleteCategory(categoryId);

    return c.json(category);
  })
  .get('/category/:id', async (c) => {
    const categoryId = c.req.param('id');
    const category = await findShoppingCategory(categoryId);
    if (!category) {
      return c.json({ error: m.error_category_not_found() }, 404);
    }

    return c.json(category);
  })
  .get('/categoriesWithItems', async (c) => {
    return c.json(await findAllShoppingCategories());
  })
  .get('/categoriesWithActiveItems', async (c) => {
    return c.json(await findActiveItemsByCategory());
  })
  .get('/items', async (c) => {
    return c.json(await findAllShoppingItems());
  })
  .post('/items', zValidator('json', itemsSchema), async (c) => {
    const items = c.req.valid('json');

    const loggedInUser = c.get('loggedInUser');

    const needsCategorization = await addStagedShoppingList(loggedInUser.id, items);
    if (!needsCategorization) {
      await commitStagedItems(loggedInUser.id);
    }

    return c.json({ success: true });
  })
  .post('/categorizeItems', zValidator('json', categorizeItemSchema), async (c) => {
    const data = c.req.valid('json');

    const loggedInUser = c.get('loggedInUser');

    await assignCategoryToStagedItems(loggedInUser.id, data.itemIds, data.categoryId);

    const finished = await categorizationFinished(loggedInUser.id);
    if (finished) {
      await commitStagedItems(loggedInUser.id);
    }

    return c.json({ success: true, finished });
  })
  .post('/cancelStagedItems', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    await deleteStagedList(loggedInUser.id);

    return c.json({ success: true });
  })
  .get('/itemSuggestions', async (c) => {
    return c.json(await getItemAddSuggestions());
  })
  .get('/stagedItems', async (c) => {
    const user = c.get('loggedInUser');

    return c.json((await findStagedShoppingList(user.id)) ?? null);
  })
  .post('/setItemCategory', zValidator('json', setCategorySchema), async (c) => {
    const setCategory = c.req.valid('json');

    await assignCategoryToShoppingItems(setCategory.itemIds, setCategory.categoryId);

    return c.json({ success: true });
  })
  .post('/deactivateItems', zValidator('json', itemActionSchema), async (c) => {
    const action = c.req.valid('json');

    await deactivateShoppingItems(action.itemIds);

    return c.json({ success: true });
  })
  .post('/deleteItems', zValidator('json', itemActionSchema), async (c) => {
    const action = c.req.valid('json');

    await deleteShoppingItems(action.itemIds);

    return c.json({ success: true });
  })
  .post('/moveCategoryUp', zValidator('json', categoryActionSchema), async (c) => {
    const action = c.req.valid('json');

    await moveCategoryOrderUp(action.categoryId);

    return c.json({ success: true });
  })
  .post('/moveCategoryDown', zValidator('json', categoryActionSchema), async (c) => {
    const action = c.req.valid('json');

    await moveCategoryOrderDown(action.categoryId);

    return c.json({ success: true });
  })
  .get('/purchases', async (c) => {
    return c.json(await findAllPurchases())
  })
  .get('/activePurchase', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    const categories = await findActiveItemsByCategory();

    const unstagedItemsByCategory = [];
    const stagedItemsForUser = [];
    const stagedItemsForOtherUsers = [];

    for (const category of categories) {
      const currentCategoryUnstaged = [];

      for (const item of category.shoppingItems) {
        if (!item.stagedPurchase) {
          currentCategoryUnstaged.push(item);
        } else if (item.stagedPurchase.userId === loggedInUser.id) {
          stagedItemsForUser.push(item);
        } else {
          stagedItemsForOtherUsers.push(item);
        }
      }

      if (currentCategoryUnstaged.length > 0) {
        unstagedItemsByCategory.push({
          id: category.id,
          name: category.name,
          shoppingItems: currentCategoryUnstaged
        });
      }
    }

    return c.json({
      unstagedItemsByCategory,
      stagedItemsForUser,
      stagedItemsForOtherUsers
    });
  })
  .post('/stagePurchaseItem', zValidator('json', stagingItemSchema), async (c) => {
    const data = c.req.valid('json');
    const loggedInUser = c.get('loggedInUser');

    await stagePurchaseItem(data.itemId, loggedInUser.id);

    return c.json({ success: true });
  })
  .post('/unstagePurchaseItem', zValidator('json', stagingItemSchema), async (c) => {
    const data = c.req.valid('json');
    const loggedInUser = c.get('loggedInUser');

    await unstagePurchaseItem(data.itemId, loggedInUser.id);

    return c.json({ success: true });
  })
  .post('/commitPurchase', async (c) => {
    const loggedInUser = c.get('loggedInUser');

    const purchaseId = await createShoppingPurchase(loggedInUser.id) ?? null;

    return c.json({ success: true, purchaseId });
  })
;

export default shoppingRouter;
