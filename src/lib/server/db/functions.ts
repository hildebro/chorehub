import { encodeBase32LowerCase } from '@oslojs/encoding';
import { randomBytes } from 'crypto';
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  max,
  min,
  or,
  SQL,
  sql
} from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { lte } from 'drizzle-orm/sql/expressions/conditions';
import { getTx } from '$lib/context';
import type { UserPayload } from '$lib/server/api/user';
import { hashPassword, verifyPassword } from '$lib/server/db/crypto';
import * as table from '$lib/server/db/schema';
import {
  type Session,
  shoppingCategory,
  type ShoppingCategory,
  type ShoppingCategoryWithRelation,
  type ShoppingItem,
  shoppingItem,
  stagedShoppingPurchaseItem,
  type TaskWithRelation,
  type User
} from '$lib/server/db/schema';
import { Assignment, TaskType, type Weekday } from '$lib/utils/taskHelper';
import { Admin } from '$lib/utils/userHelper';

// ------- HOUSEHOLD -------
export const addHousehold = async (name: string): Promise<string> => {
  const db = getTx();

  const householdId = generateUUID();

  await db.insert(table.household).values({ id: householdId, name }).execute();

  return householdId;
};

export const updateHousehold = async (id: string, name: string) => {
  const db = getTx();

  await db.update(table.household).set({ name }).where(eq(table.household.id, id)).execute();
};

export const findHousehold = async (id: string) => {
  const db = getTx();

  return db.query.household.findFirst({
    with: {
      users: {}
    },
    where: eq(table.household.id, id)
  }).execute();
};

export const findAllHouseholds = async () => {
  const db = getTx();

  return db.query.household.findMany({
    with: {
      users: {}
    }
  }).execute();
};

// ------- USER -------
export const findUser = async (userId: string): Promise<User | undefined> => {
  const db = getTx();

  const result = await db.select().from(table.user).where(eq(table.user.id, userId));

  return result.at(0);
};

export const findAllUsers = async (): Promise<User[]> => {
  const db = getTx();

  return db.select().from(table.user).execute();
};

export const findHouseholdUsers = async (householdId: string): Promise<User[]> => {
  const db = getTx();

  return db.select()
    .from(table.user)
    .where(eq(table.user.householdId, householdId))
    .execute();
};

export const addUser = async (username: string, password: string, householdId: string, admin: Admin): Promise<string> => {
  const db = getTx();

  const userId = generateUUID();

  let insertValue: {
    id: string,
    username: string,
    password: string,
    admin: Admin,
    householdId?: string
  } = {
    id: userId,
    username,
    password: await hashPassword(password),
    admin
  };
  if (householdId) {
    insertValue = { ...insertValue, householdId };
  }
  await db.insert(table.user).values(insertValue).execute();

  return userId;
};

export const updateUser = async (userId: string, username: string, password: string | undefined, admin: Admin): Promise<void> => {
  const db = getTx();

  let update: { username: string, password?: string, admin: Admin } = {
    username,
    admin
  };
  if (password) {
    update = { ...update, password: await hashPassword(password) };
  }

  await db.update(table.user).set(update).where(eq(table.user.id, userId)).execute();
};

export const isUsernameTaken = async (username: string, householdId: string, updatedUserId: string | null) => {
  const db = getTx();

  const user = await db.query.user
    .findFirst({
      where: and(
        eq(table.user.username, username),
        eq(table.user.householdId, householdId)
      )
    })
    .execute();

  if (!user) {
    return false;
  }

  if (!updatedUserId) {
    return true;
  }

  return user.id !== updatedUserId;
};

export const findAndVerifyUser = async (username: string, password: string, householdName: string): Promise<User | undefined> => {
  const db = getTx();

  const user = (
    await db.select(getTableColumns(table.user))
      .from(table.user)
      .innerJoin(table.household, eq(table.user.householdId, table.household.id))
      .where(and(
        eq(table.user.username, username),
        eq(table.household.name, householdName)
      ))
  ).at(0);

  if (!user) {
    return undefined;
  }

  if (await verifyPassword(password, user.password)) {
    return user;
  }

  return undefined;
};

/**
 * Asserts that the logged-in-user is authorized to run the given update payload.
 */
export const assertLoggedInUserAuthorizedUpdate = async (loggedInUser: User, userUpdatePayload: UserPayload) => {
  // Server admins can do anything.
  if (loggedInUser.admin === Admin.Server) {
    return true;
  }

  // A non-admin can do no updates.
  if (loggedInUser.admin === Admin.None) {
    return false;
  }

  // The user is a household admin, meaning updates are only allowed for matching household users.
  if (loggedInUser.householdId !== userUpdatePayload.householdId) {
    return false;
  }

  // Cannot promote to server admin status.
  if (userUpdatePayload.admin === Admin.Server) {
    return false;
  }

  // Nothing to check, if the user doesn't exist yet.
  if (!userUpdatePayload.id) {
    return true;
  }

  const dbUser = await findUser(userUpdatePayload.id) as User;

  // The existing user admin status cannot be on a higher level than the logged-in-user.
  return dbUser.admin !== Admin.Server;
};

/**
 * Asserts that there will be at least one server admin after the payload is applied. Also asserts that the household
 * the user belongs to will have at least one household admin.
 */
export const assertPermissibleAdminUpdate = async (user: UserPayload) => {
  // A new user payload cannot produce a state without admins.
  if (!user.id) {
    return true;
  }

  // If the payload is a server admin, we know that the update is not creating a situation where no admins are present.
  if (user.admin === Admin.Server) {
    return true;
  }

  const db = getTx();

  const serverAdmins = await db.select()
    .from(table.user)
    .where(eq(table.user.admin, Admin.Server))
    .execute();

  // Only one server admin exists and the payload would remove that last admin.
  if (serverAdmins.length === 1 && serverAdmins.at(0)!.id === user.id) {
    return false;
  }

  // At this point we know that server admins are covered. So if the new user state is household admin,
  // we know that the payload didn't remove the last household admin.
  if (user.admin === Admin.Household) {
    return true;
  }

  // Looking for admins that are in the same household as the user payload.
  const householdAdmins = await db.select()
    .from(table.user)
    .where(
      and(
        eq(table.user.householdId, user.householdId),
        inArray(table.user.admin, [Admin.Server, Admin.Household])
      )
    )
    .execute();

  // Permissible, if there is more than one admin or if that single existing admin is not the user of the payload.
  return householdAdmins.length > 1 || householdAdmins.at(0)!.id !== user.id;
};

export const assertMatchingHousehold = async (userIds: string[]): Promise<boolean> => {
  const db = getTx();

  const householdIds = await db.selectDistinct({ householdId: table.user.householdId })
    .from(table.user)
    .where(inArray(table.user.id, userIds))
    .execute();

  return householdIds.length === 1;
};

export const updateDefaultDistribution = async (
  distributions: { userId: string; percent: number }[]
): Promise<void> => {
  const db = getTx();

  for (const distribution of distributions) {
    await db
      .update(table.user)
      .set({ defaultDistribution: distribution.percent })
      .where(eq(table.user.id, distribution.userId))
      .execute();
  }
};

export const dismissHelpDisclaimer = async (userId: string) => {
  const db = getTx();

  await db
    .update(table.user)
    .set({ helpDisclaimerDismissed: true })
    .where(eq(table.user.id, userId))
    .execute();
};

// ------- SESSION -------
export const createSession = async (userId: string) => {
  const db = getTx();

  const sessionToken = randomBytes(32).toString('hex');

  const daysToKeepAlive = 10;
  const secondsToKeepAlive = 60 * 60 * 24 * daysToKeepAlive;
  const expiresAt = new Date(Date.now() + secondsToKeepAlive * 1000);

  const session = {
    id: sessionToken,
    userId,
    expiresAt
  };
  await db.insert(table.session).values(session);

  return session;
};

export const findSession = async (sessionToken: string): Promise<Session | undefined> => {
  const db = getTx();

  const result = await db.select()
    .from(table.session)
    .where(and(
      eq(table.session.id, sessionToken),
      gt(table.session.expiresAt, new Date())
    ));

  return result.at(0);
};

export const deleteSession = async (sessionToken: string) => {
  const db = getTx();

  await db.delete(table.session).where(eq(table.session.id, sessionToken)).execute();
};

// ------- SHOPPING CATEGORY -------
export const findShoppingCategory = async (categoryId: string) => {
  const db = getTx();

  return db.query.shoppingCategory.findFirst({
    with: {
      shoppingItems: {
        orderBy: [asc(shoppingItem.priority)]
      }
    },
    where: eq(table.shoppingCategory.id, categoryId)
  }).execute();
};

export const findAllShoppingCategories = async (): Promise<ShoppingCategoryWithRelation[]> => {
  const db = getTx();

  return db.query.shoppingCategory.findMany({
    with: {
      shoppingItems: {
        with: {
          stagedPurchase: {}
        },
        orderBy: [asc(shoppingItem.priority)]
      }
    },
    orderBy: [asc(shoppingCategory.priority)]
  }).execute();
};

export const findActiveItemsByCategory = async (): Promise<ShoppingCategoryWithRelation[]> => {
  const db = getTx();

  return db.query.shoppingCategory.findMany({
    // only return categories with at least one active item
    where: (category, { exists }) =>
      exists(
        db.select()
          .from(shoppingItem)
          .where(
            and(
              eq(shoppingItem.categoryId, category.id),
              eq(shoppingItem.active, true)
            )
          )
      ),
    // populate the category with its active items
    with: {
      shoppingItems: {
        with: {
          stagedPurchase: {}
        },
        where: eq(shoppingItem.active, true),
        orderBy: [asc(shoppingItem.priority)]
      }
    },
    orderBy: [asc(shoppingCategory.priority)]
  }).execute();
};

export const updateShoppingCategory = async (categoryId: string, name: string): Promise<void> => {
  const db = getTx();

  await db.update(table.shoppingCategory).set({ name: name }).where(eq(table.shoppingCategory.id, categoryId)).execute();
};

export const addShoppingCategory = async (name: string): Promise<void> => {
  const db = getTx();

  // Look for the current maximum priority. If none exists, we use -1 as the fallback.
  const currentMaxPriority = (
    await db
      .select({ value: max(table.shoppingCategory.priority) })
      .from(table.shoppingCategory)
  ).at(0)?.value ?? -1;
  // Increment the current maximum to use as the next one.
  const nextPriority = currentMaxPriority + 1;

  await db.insert(table.shoppingCategory).values({
    id: generateUUID(),
    name: name,
    priority: nextPriority
  });
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const db = getTx();

  await db.delete(table.shoppingCategory).where(eq(table.shoppingCategory.id, categoryId)).execute();
};

export const moveCategoryOrderUp = async (categoryId: string) => {
  const db = getTx();

  const category = await findShoppingCategory(categoryId);
  if (!category) {
    throw new Error('Trying to move a non-existent category');
  }

  const [categoryAbove] = await db
    .select()
    .from(table.shoppingCategory)
    .where(lt(table.shoppingCategory.priority, category.priority))
    .orderBy(desc(table.shoppingCategory.priority))
    .limit(1);

  await executePrioritySwap(categoryAbove, category);
};

export const moveCategoryOrderDown = async (categoryId: string) => {
  const db = getTx();

  const category = await findShoppingCategory(categoryId);
  if (!category) {
    throw new Error('Trying to move a non-existent category');
  }

  const [categoryBelow] = await db
    .select()
    .from(table.shoppingCategory)
    .where(gt(table.shoppingCategory.priority, category.priority))
    .orderBy(asc(table.shoppingCategory.priority))
    .limit(1);

  await executePrioritySwap(category, categoryBelow);
};

async function executePrioritySwap(
  categoryAbove: ShoppingCategory,
  categoryBelow: ShoppingCategory
) {
  const db = getTx();

  await db.update(table.shoppingCategory)
    .set({ priority: categoryAbove.priority })
    .where(eq(table.shoppingCategory.id, categoryBelow.id));

  await db.update(table.shoppingCategory)
    .set({ priority: categoryBelow.priority })
    .where(eq(table.shoppingCategory.id, categoryAbove.id));
}

// ------- SHOPPING ITEM -------
export const findShoppingItem = async (name: string): Promise<ShoppingItem | undefined> => {
  const db = getTx();

  return (await db.select()
      .from(table.shoppingItem)
      .where(eq(lower(table.shoppingItem.name), name.toLowerCase()))
  ).at(0);
};

export const reactivateShoppingItem = async (itemId: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.update(table.shoppingItem).set({
    active: true,
    amount: amount
  }).where(eq(table.shoppingItem.id, itemId)).execute();
};

export const deleteShoppingItems = async (itemIds: string[]): Promise<void> => {
  const db = getTx();

  if (itemIds.length > 0) {
    await db.delete(table.shoppingPurchaseItem).where(inArray(table.shoppingPurchaseItem.itemId, itemIds));
    await db.delete(table.shoppingItem).where(inArray(table.shoppingItem.id, itemIds));
  }
};

export const deactivateShoppingItems = async (itemIds: string[]): Promise<void> => {
  const db = getTx();

  if (itemIds.length > 0) {
    await db.update(table.shoppingItem)
      .set({ active: false })
      .where(inArray(table.shoppingItem.id, itemIds))
      .execute();
  }
};

export const addShoppingItem = async (categoryId: string, name: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  // If we have a matching inactive item, we just make it active again.
  const existingItemId = (await db.select({ id: table.shoppingItem.id })
      .from(table.shoppingItem)
      .where(and(
        eq(table.shoppingItem.categoryId, categoryId),
        eq(table.shoppingItem.name, name),
        eq(table.shoppingItem.active, false)
      ))
  ).at(0)?.id;
  if (existingItemId) {
    await db.update(table.shoppingItem).set({
      active: true,
      amount: amount
    }).where(eq(table.shoppingItem.id, existingItemId)).execute();

    return;
  }

  // Otherwise we add a new item at the end of the list.
  const currentMaxPriority = (
    await db
      .select({ value: max(table.shoppingItem.priority) })
      .from(table.shoppingItem)
      .where(eq(table.shoppingItem.categoryId, categoryId))
  ).at(0);
  const nextPriority = typeof currentMaxPriority?.value === 'number' ? currentMaxPriority.value + 1 : 0;

  await db.insert(table.shoppingItem).values({
    id: generateUUID(),
    categoryId: categoryId,
    name: name,
    amount: amount,
    priority: nextPriority,
    active: true
  });
};

export const assignCategoryToShoppingItems = async (itemIds: string[], categoryId: string) => {
  const db = getTx();

  await db.update(table.shoppingItem)
    .set({
      categoryId: categoryId
    })
    .where(inArray(table.shoppingItem.id, itemIds)).execute();
};

export const countActiveShoppingItems = async () => {
  const db = getTx();

  return (await db.select({ count: count(table.shoppingItem.id) })
      .from(table.shoppingItem)
      .where(eq(table.shoppingItem.active, true))
      .execute()
  ).at(0)?.count ?? 0;
};

export const findAllShoppingItems = async () => {
  const db = getTx();

  return db.query.shoppingItem.findMany().execute();
};

export const getItemAddSuggestions = async (frequentlyBoughtThreshold: number = 4) => {
  const db = getTx();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Subquery to exclude recently bought items or currently active items
  const excludedItems = db.$with('recent_purchases').as(
    db.select({
      itemId: table.shoppingPurchaseItem.itemId
    })
      .from(table.shoppingPurchaseItem)
      .innerJoin(table.shoppingItem, eq(table.shoppingPurchaseItem.itemId, table.shoppingItem.id))
      .innerJoin(table.shoppingPurchase, eq(table.shoppingPurchaseItem.purchaseId, table.shoppingPurchase.id))
      .where(
        or(
          gte(table.shoppingPurchase.date, sevenDaysAgo),
          eq(table.shoppingItem.active, true)
        )
      )
  );

  return db.with(excludedItems).select({
    id: shoppingItem.id,
    name: shoppingItem.name,
    purchaseCount: count(table.shoppingPurchaseItem.itemId),
    lastPurchaseDate: max(table.shoppingPurchase.date) as SQL<Date>
  })
    .from(shoppingItem)
    .innerJoin(table.shoppingPurchaseItem, eq(shoppingItem.id, table.shoppingPurchaseItem.itemId))
    .innerJoin(table.shoppingPurchase, eq(table.shoppingPurchaseItem.purchaseId, table.shoppingPurchase.id))
    // Any item that isn't excluded
    .where(sql`NOT EXISTS (SELECT 1 FROM
    ${excludedItems}
    WHERE
    ${excludedItems.itemId}
    =
    ${shoppingItem.id}
    )`)
    .groupBy(shoppingItem.id, shoppingItem.name)
    // That has been bought at least X amount of times
    .having(gte(count(table.shoppingPurchaseItem.itemId), frequentlyBoughtThreshold))
    .orderBy(desc(count(table.shoppingPurchaseItem.itemId)))
    .limit(6);
};

// ------- SHOPPING PURCHASE -------
export const createShoppingPurchase = async (userId: string) => {
  const db = getTx();

  const stagedItems = (await findStagedPurchaseItemsByUser(userId))
    .map(stagedItem => stagedItem.itemId);
  if (stagedItems.length === 0) {
    return;
  }

  // Create a new purchase
  const purchaseId = generateUUID();
  await db.insert(table.shoppingPurchase)
    .values({
      id: purchaseId,
      date: new Date(),
      userId
    })
    .execute();

  // Create entries in the junction table
  const purchaseItemInserts = stagedItems.map((itemId) => ({
    purchaseId,
    itemId
  }));
  await db.insert(table.shoppingPurchaseItem).values(purchaseItemInserts);

  // Remove items from staging and deactivate them
  await db.delete(table.stagedShoppingPurchaseItem).where(inArray(stagedShoppingPurchaseItem.itemId, stagedItems));
  await deactivateShoppingItems(stagedItems);

  return purchaseId;
};

export const fetchLastPurchaseDate = async () => {
  const db = getTx();

  return (await db.select({ date: max(table.shoppingPurchase.date) })
      .from(table.shoppingPurchase)
      .execute()
  ).at(0)?.date?.toISOString() ?? null;
};

export const findAllPurchases = async () => {
  const db = getTx();

  return db.query.shoppingPurchase.findMany({
    with: {
      shoppingItems: {},
      user: {},
      balanceEntry: {}
    },
    orderBy: [desc(table.shoppingPurchase.date)]
  }).execute();
};

export const stagePurchaseItem = async (itemId: string, userId: string) => {
  const db = getTx();
  const existingStagedItem = await db.query.stagedShoppingPurchaseItem.findFirst({
    where: eq(table.stagedShoppingPurchaseItem.itemId, itemId)
  }).execute();
  if (existingStagedItem) {
    return;
  }

  await db.insert(table.stagedShoppingPurchaseItem).values({ itemId, userId }).execute();
};

export const unstagePurchaseItem = async (itemId: string, userId: string) => {
  const db = getTx();
  await db.delete(table.stagedShoppingPurchaseItem).where(
    and(
      eq(table.stagedShoppingPurchaseItem.itemId, itemId),
      eq(table.stagedShoppingPurchaseItem.userId, userId)
    )
  ).execute();
};

export const findStagedPurchaseItemsByUser = async (userId: string) => {
  const db = getTx();

  return db.query.stagedShoppingPurchaseItem.findMany({
    where: eq(table.stagedShoppingPurchaseItem.userId, userId)
  }).execute();
};

// ------- BALANCE --------
export const addBalanceEntry = async (
  userId: string,
  name: string,
  price: number,
  distributions: { userId: string, percent: number }[],
  purchaseId: string | null
): Promise<void> => {
  const db = getTx();

  const entryId = generateUUID();
  await db.insert(table.balanceEntry).values({
    id: entryId,
    userId,
    date: new Date(),
    name,
    price
  });

  if (purchaseId) {
    await db
      .update(table.shoppingPurchase)
      .set({ balanceEntryId: entryId })
      .where(eq(table.shoppingPurchase.id, purchaseId))
      .execute();
  }

  for (const distribution of distributions) {
    if (distribution.percent > 0) {
      await db.insert(table.balanceEntryDistribution).values({
        entryId,
        userId: distribution.userId,
        percent: distribution.percent
      });
    }
  }
};

export const updateBalanceEntry = async (
  entryId: string,
  userId: string,
  name: string,
  price: number,
  distributions: { userId: string; percent: number }[]
): Promise<void> => {
  const db = getTx();

  await db
    .update(table.balanceEntry)
    .set({ name, userId, price })
    .where(eq(table.balanceEntry.id, entryId))
    .execute();

  await db
    .delete(table.balanceEntryDistribution)
    .where(eq(table.balanceEntryDistribution.entryId, entryId))
    .execute();
  for (const distribution of distributions) {
    if (distribution.percent > 0) {
      await db.insert(table.balanceEntryDistribution).values({
        entryId,
        userId: distribution.userId,
        percent: distribution.percent
      });
    }
  }
};

export const findBalanceEntry = async (entryId: string) => {
  const db = getTx();

  return db.query.balanceEntry
    .findFirst({
      with: {
        distributions: {}
      },
      where: eq(table.balanceEntry.id, entryId)
    })
    .execute();
};

export const findAllBalanceEntries = async () => {
  const db = getTx();

  return db.query.balanceEntry
    .findMany({
      with: {
        user: {}
      },
      orderBy: [desc(table.balanceEntry.date)]
    })
    .execute();
};

export type DebtResult = {
  creditor: User;
  debtorData: {
    debtor: User;
    amount: number;
  }[];
};

export async function calculateUserDebts(): Promise<DebtResult[]> {
  const db = getTx();

  const entries = await db.query.balanceEntry.findMany({
    with: {
      user: true,
      distributions: { with: { user: true } }
    }
  });

  const userRegistry = new Map<string, User>();
  const grossDebtMap: Record<string, Record<string, number>> = {};

  // Accumulate Gross Debts
  for (const entry of entries) {
    const creditorId = entry.userId;
    userRegistry.set(creditorId, entry.user);

    for (const distribution of entry.distributions) {
      if (creditorId === distribution.userId) continue;

      userRegistry.set(distribution.userId, distribution.user);

      const debtorId = distribution.userId;
      const share = Math.round(entry.price * (distribution.percent / 100));

      grossDebtMap[debtorId] ??= {};
      grossDebtMap[debtorId][creditorId] = (grossDebtMap[debtorId][creditorId] || 0) + share;
    }
  }

  // Calculate Net Debts & Group by Creditor
  const resultsByCreditor = new Map<string, DebtResult>();

  for (const debtorId of Object.keys(grossDebtMap)) {
    for (const creditorId of Object.keys(grossDebtMap[debtorId])) {

      const amountAtoB = grossDebtMap[debtorId]?.[creditorId] || 0;
      const amountBtoA = grossDebtMap[creditorId]?.[debtorId] || 0;
      const netAmount = amountAtoB - amountBtoA;

      // Only process positive net flow.
      // The reverse case (B owes A) is handled when the loop encounters that key pair.
      if (netAmount <= 0) continue;

      if (!resultsByCreditor.has(creditorId)) {
        resultsByCreditor.set(creditorId, {
          creditor: userRegistry.get(creditorId) as User,
          debtorData: []
        });
      }

      resultsByCreditor.get(creditorId)!.debtorData.push({
        debtor: userRegistry.get(debtorId) as User,
        amount: netAmount
      });
    }
  }

  return Array.from(resultsByCreditor.values());
}

// ------- STAGED SHOPPING LIST -------
export const findStagedShoppingList = async (userId: string) => {
  const db = getTx();

  return db.query.stagedShoppingList.findFirst({
    with: {
      stagedItems: {
        with: {
          suggestedItem: {},
          matchedItem: {}
        }
      }
    },
    where: eq(table.stagedShoppingList.userId, userId)
  }).execute();
};

export const addStagedShoppingList = async (userId: string, items: {
  amount: string,
  name: string
}[]) => {
  const db = getTx();

  const listId = generateUUID();
  await db.insert(table.stagedShoppingList).values({
    id: listId,
    userId: userId,
    status: 'validating'
  });

  let needsCategorization = false;
  for (const item of items) {
    const matchedItem = await findShoppingItem(item.name);
    if (matchedItem) {
      await addPerfectStagedItem(listId, matchedItem, item.amount);
    } else {
      await addNewStagedItem(listId, item.name, item.amount);
      needsCategorization = true;
    }
  }

  return needsCategorization;
};

export const addPerfectStagedItem = async (listId: string, matchedItem: ShoppingItem, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.insert(table.stagedShoppingItem).values({
    id: generateUUID(),
    listId: listId,
    status: 'perfect_match',
    name: matchedItem.name,
    amount: amount ?? '',
    matchedItemId: matchedItem.id
  });
};

export const addNewStagedItem = async (listId: string, name: string, amount: string | undefined): Promise<void> => {
  const db = getTx();

  await db.insert(table.stagedShoppingItem).values({
    id: generateUUID(),
    listId: listId,
    status: 'unmatched',
    name: name,
    amount: amount ?? ''
  });
};

export const assignCategoryToStagedItems = async (userId: string, itemIds: string[], categoryId: string) => {
  const db = getTx();

  await db.update(table.stagedShoppingItem)
    .set({
      selectedCategoryId: categoryId
    })
    .from(table.stagedShoppingList)
    .where(
      and(
        eq(table.stagedShoppingItem.listId, table.stagedShoppingList.id),
        eq(table.stagedShoppingList.userId, userId),
        inArray(table.stagedShoppingItem.id, itemIds)
      )
    ).execute();
};

export const categorizationFinished = async (userId: string) => {
  const db = getTx();

  const result = await db
    .select({ uncategorizedItemCount: count(table.stagedShoppingItem.id) })
    .from(table.stagedShoppingItem)
    .innerJoin(table.stagedShoppingList, eq(table.stagedShoppingItem.listId, table.stagedShoppingList.id))
    .where(
      and(
        eq(table.stagedShoppingItem.status, 'unmatched'),
        isNull(table.stagedShoppingItem.selectedCategoryId),
        eq(table.stagedShoppingList.userId, userId)
      )
    ).execute();

  const uncategorizedItemCount = result.at(0)?.uncategorizedItemCount ?? 0;

  return uncategorizedItemCount === 0;
};

export const commitStagedItems = async (userId: string) => {
  const db = getTx();

  const list = await db.query.stagedShoppingList.findFirst({
    with: {
      stagedItems: {}
    },
    where: eq(table.stagedShoppingList.userId, userId)
  }).execute();

  if (!list) {
    throw new Error('Trying to commit nonexistent list.');
  }

  for (const item of list.stagedItems) {
    switch (item.status) {
      case 'perfect_match':
        await reactivateShoppingItem(item.matchedItemId as string, item.amount);
        continue;
      case 'unmatched':
        await addShoppingItem(item.selectedCategoryId as string, item.name, item.amount);
    }
  }

  await deleteStagedList(userId);
};

export const deleteStagedList = async (userId: string) => {
  const db = getTx();

  await db.delete(table.stagedShoppingList).where(eq(table.stagedShoppingList.userId, userId)).execute();
};

// ------- TASKS -------
export const findTask = async (taskId: string) => {
  const db = getTx();

  return db.query.task.findFirst({
    where: eq(table.task.id, taskId),
    with: {
      dueUser: {},
      completions: {}
    }
  }).execute();
};

export const findDueTasks = async (): Promise<TaskWithRelation[]> => {
  const db = getTx();

  return db.query.task.findMany({
    where: and(
      eq(table.task.done, false),
      or(
        lte(table.task.dueDate, formatDateToYYYYMMDD(new Date())),
        isNull(table.task.dueDate)
      )
    ),
    with: {
      dueUser: {},
      completions: {}
    },
    orderBy: asc(table.task.dueDate)
  });
};

export const findUpcomingTasks = async (): Promise<TaskWithRelation[]> => {
  const db = getTx();

  return db.query.task.findMany({
    where: gt(table.task.dueDate, formatDateToYYYYMMDD(new Date())),
    with: {
      dueUser: {},
      completions: {}
    },
    orderBy: asc(table.task.dueDate)
  });
};

export const findCompletedTasks = async (): Promise<TaskWithRelation[]> => {
  const db = getTx();

  return db.query.task.findMany({
    where: eq(table.task.done, true),
    with: {
      dueUser: {},
      completions: {}
    },
    orderBy: asc(table.task.dueDate)
  });
};

export const addTask = async (type: TaskType, name: string, weekday: Weekday | null, interval: number | null, assignment: Assignment | null, userId: string | null, dueDate: string | null) => {
  const db = getTx();

  await db.insert(table.task).values({
    id: generateUUID(),
    name: name,
    type,
    dueWeekday: weekday,
    dueInterval: interval,
    assignment,
    dueUserId: userId,
    dueDate: getDueDateString(dueDate, weekday, interval)
  });
};

export const updateTask = async (taskId: string, type: TaskType, name: string, weekday: Weekday | null, interval: number | null, assignment: Assignment | null, userId: string | null, dueDate: string | null) => {
  const db = getTx();

  await db.update(table.task)
    .set({
      name: name,
      type,
      dueWeekday: weekday as Weekday,
      dueInterval: interval,
      assignment,
      dueUserId: userId,
      dueDate: getDueDateString(dueDate, weekday, interval)
    })
    .where(eq(table.task.id, taskId));
};

const getDueDateString = (dueDate: string | null, weekday: Weekday | null, interval: number | null) => {
  if (dueDate) {
    return dueDate;
  }

  if (weekday === null || interval === null) {
    return null;
  }

  return formatDateToYYYYMMDD(calculateNextDueDate(weekday, interval));
};

/**
 * Calculates the date of the next occurrence of a specific weekday based on the current time.
 */
function calculateNextDueDate(weekdayName: Weekday, interval: number): Date {
  const weekdayMap: { [key: string]: number } = {
    'sun': 0,
    'mon': 1,
    'tue': 2,
    'wed': 3,
    'thu': 4,
    'fri': 5,
    'sat': 6
  };

  const targetDayOfWeek = weekdayMap[weekdayName];

  const now = new Date();
  const currentDayOfWeek = now.getDay();

  // Figure out the distance between target and current weekday.
  let diff = targetDayOfWeek - currentDayOfWeek;
  // If the distance is positive, it means the closest target weekday is in the future. To make the following
  // calculation a bit simpler, we take away 7 days so that `diff` at this point will always point to the most recent
  // matching weekday.
  if (diff > 0) {
    diff -= 7;
  }

  // Now we can simply add 7 days per desired interval to know how many days it takes to get to the next target weekday.
  diff = diff + (7 * interval);

  // Create a new `Date` object starting from `now` and add the calculated difference in days.
  // This preserves the time of day from the `now` object.
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + diff);

  return nextDate;
}

export const markTaskAsDone = async (taskId: string, doneByUserId: string | null = null): Promise<void> => {
  const db = getTx();

  const task = await db.query.task.findFirst({ where: eq(table.task.id, taskId) });
  if (!task) {
    throw new Error('entity not found');
  }

  if (task.type === 'single') {
    await db.update(table.task).set({
      done: true,
      dueUserId: doneByUserId
    }).where(eq(table.task.id, taskId)).execute();

    return;
  }

  const completionUserId = doneByUserId ?? task.dueUserId as string;
  await db.insert(table.taskCompletion).values({
    id: generateUUID(),
    taskId,
    userId: completionUserId,
    date: formatDateToYYYYMMDD(new Date())
  });

  const dueDate = formatDateToYYYYMMDD(calculateNextDueDate(task.dueWeekday as Weekday, task.dueInterval as number));
  const dueUserId = await findNextDueUserId(taskId);

  await db.update(table.task)
    .set({ dueDate, dueUserId })
    .where(eq(table.task.id, taskId))
    .execute();
};

/**
 * Finds which user is supposed to do the task next. This is determined by the following ordering:
 * 1. How often has the task been done already?
 *   => The user with the fewest completions is picked first.
 * 2. When was the first completion?
 *   => When multiple people has the same completion count, the one with the oldest completion is picked first.
 */
async function findNextDueUserId(taskId: string): Promise<string | null> {
  const db = getTx();

  const taskData = await db.select({
    dueUserId: table.task.dueUserId,
    assignment: table.task.assignment
  })
    .from(table.task)
    .where(eq(table.task.id, taskId));

  const task = taskData.at(0);
  if (!task) {
    throw new Error('entity not found');
  }

  if (task.assignment === Assignment.Someone) {
    return task.dueUserId;
  }

  if (task.assignment === Assignment.Noone) {
    return null;
  }

  const completionsPerUser = await db
    .select({
      id: table.user.id,
      completionCount: count(table.taskCompletion.id)
        .mapWith(Number)
        .as('completionCount'),
      earliestCompletionDate: min(table.taskCompletion.date).as('earliestCompletionDate')
    })
    .from(table.user)
    .leftJoin(
      table.taskCompletion,
      and(
        eq(table.user.id, table.taskCompletion.userId),
        eq(table.taskCompletion.taskId, taskId)
      )
    )
    .groupBy(table.user.id)
    .orderBy(asc(count(table.taskCompletion.id)), asc(min(table.taskCompletion.date)));

  return completionsPerUser[0].id;
}

export const countDueTasks = async (userId: string) => {
  const db = getTx();

  const tasks = await db.query.task.findMany({
    where: and(
      eq(table.task.done, false),
      eq(table.task.dueUserId, userId),
      lte(table.task.dueDate, formatDateToYYYYMMDD(new Date()))
    )
  }).execute();

  return tasks.length;
};

// ------- GENERIC -------

/**
 * Formats a Date object into a 'YYYY-MM-DD' string suitable for SQL DATE type.
 * @param date The Date object to format.
 * @returns The date formatted as 'YYYY-MM-DD'.
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  // getMonth() is 0-indexed, so add 1. padStart ensures two digits (e.g., '01' instead of '1').
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  // getDate() gets the day of the month. padStart ensures two digits.
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function generateUUID() {
  // ID with 120 bits of entropy, or about the same as UUID v4.
  const bytes = crypto.getRandomValues(new Uint8Array(15));
  return encodeBase32LowerCase(bytes);
}

export function lower(value: AnyPgColumn): SQL {
  // Formatting would be a bit ugly, if this call was inlined rather than being in this helper function.
  return sql`lower
      (${value})`;
}
