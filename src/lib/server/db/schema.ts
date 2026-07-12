// noinspection JSUnusedGlobalSymbols The entities are referenced through svelte magic.

import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique
} from 'drizzle-orm/pg-core';
import { SystemStoreKey } from '$lib/utils/systemStoreHelper';
import { Assignment, TaskType, Weekday } from '$lib/utils/taskHelper';
import { Admin } from '$lib/utils/userHelper';

// ============================================================================
// SYSTEM STORE
// ============================================================================
export const systemStoreKeyEnum = pgEnum('systemStoreKey', SystemStoreKey);

export const systemStore = pgTable('system_store', {
  key: systemStoreKeyEnum().primaryKey(),
  value: text().notNull(),
  createdAt: timestamp().defaultNow().notNull()
});

// ============================================================================
// HOUSEHOLD
// ============================================================================

export const household = pgTable('household', {
  id: text().primaryKey(),
  name: text().notNull().unique(),
  createdAt: timestamp().defaultNow().notNull()
});
export type Household = typeof household.$inferSelect;

export const householdRelations = relations(household, ({ many }) => ({
  users: many(user),
  shoppingCategories: many(shoppingCategory),
  shoppingItems: many(shoppingItem),
  shoppingPurchases: many(shoppingPurchase),
  balanceEntries: many(balanceEntry),
  tasks: many(task)
}));

// ============================================================================
// USER & SESSION
// ============================================================================
export const adminEnum = pgEnum('admin', Admin);

export const user = pgTable('user', {
  id: text().primaryKey(),
  householdId: text()
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' })
    .default(sql`current_setting('app.current_household_id')`),
  username: text().notNull(),
  password: text().notNull(),
  admin: adminEnum().notNull().default(Admin.None),
  defaultDistribution: doublePrecision(),
  helpDisclaimerDismissed: boolean().notNull().default(false),
}, (table) => [
  unique().on(table.username, table.householdId)
]);
export type User = typeof user.$inferSelect;

export const userRelations = relations(user, ({ one, many }) => ({
  household: one(household, {
    fields: [user.householdId],
    references: [household.id]
  }),
  shoppingPurchases: many(shoppingPurchase)
}));

export const session = pgTable('session', {
  id: text().primaryKey(),
  userId: text().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp().notNull()
});
export type Session = typeof session.$inferSelect;

// ============================================================================
// SHOPPING
// ============================================================================

export const shoppingCategory = pgTable('shopping_category', {
  id: text().primaryKey(),
  householdId: text()
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' })
    .default(sql`current_setting('app.current_household_id')`),
  name: text().notNull().unique(),
  priority: integer().notNull()
}, () => [
  pgPolicy('isolate_households', {
    for: 'all',
    using: sql`household_id = current_setting('app.current_household_id', true)`
  })
]).enableRLS();
export type ShoppingCategory = typeof shoppingCategory.$inferSelect;

export type ShoppingCategoryWithRelation = InferSelectModel<typeof shoppingCategory> & {
  shoppingItems: (InferSelectModel<typeof shoppingItem> & {
    stagedPurchase: InferSelectModel<typeof stagedShoppingPurchaseItem>
  })[];
};

export const shoppingCategoryRelations = relations(shoppingCategory, ({ one, many }) => ({
  household: one(household, {
    fields: [shoppingCategory.householdId],
    references: [household.id]
  }),
  shoppingItems: many(shoppingItem)
}));

export const shoppingItem = pgTable('shopping_item', {
  id: text().primaryKey(),
  householdId: text()
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' })
    .default(sql`current_setting('app.current_household_id')`),
  categoryId: text().references(() => shoppingCategory.id),
  name: text().notNull().unique(),
  amount: text().notNull().default(''),
  priority: integer().notNull(),
  active: boolean().notNull()
}, () => [
  pgPolicy('isolate_households', {
    for: 'all',
    using: sql`household_id = current_setting('app.current_household_id', true)`
  })
]).enableRLS();
export type ShoppingItem = typeof shoppingItem.$inferSelect;

export const shoppingItemRelations = relations(shoppingItem, ({ one, many }) => ({
  household: one(household, {
    fields: [shoppingItem.householdId],
    references: [household.id]
  }),
  category: one(shoppingCategory, {
    fields: [shoppingItem.categoryId],
    references: [shoppingCategory.id]
  }),
  stagedPurchase: one(stagedShoppingPurchaseItem, {
    fields: [shoppingItem.id],
    references: [stagedShoppingPurchaseItem.itemId]
  }),
  shoppingPurchases: many(shoppingPurchaseItem)
}));

export const shoppingPurchase = pgTable('shopping_purchase', {
  id: text().primaryKey(),
  householdId: text()
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' })
    .default(sql`current_setting('app.current_household_id')`),
  date: timestamp().notNull(),
  userId: text().references(() => user.id).notNull(),
  balanceEntryId: text().references(() => balanceEntry.id)
}, () => [
  pgPolicy('isolate_households', {
    for: 'all',
    using: sql`household_id = current_setting('app.current_household_id', true)`
  })
]).enableRLS();
export type ShoppingPurchase = typeof shoppingPurchase.$inferSelect;

export const shoppingPurchaseRelations = relations(shoppingPurchase, ({ one, many }) => ({
  household: one(household, {
    fields: [shoppingPurchase.householdId],
    references: [household.id]
  }),
  user: one(user, {
    fields: [shoppingPurchase.userId],
    references: [user.id]
  }),
  balanceEntry: one(balanceEntry, {
    fields: [shoppingPurchase.balanceEntryId],
    references: [balanceEntry.id]
  }),
  shoppingItems: many(shoppingPurchaseItem)
}));

// Junction table for many-to-many relationship between shoppingPurchase and shoppingItem
export const shoppingPurchaseItem = pgTable('shopping_purchase_item', {
    purchaseId: text().notNull().references(() => shoppingPurchase.id, { onDelete: 'cascade' }),
    itemId: text().notNull().references(() => shoppingItem.id, { onDelete: 'cascade' })
  },
  (t) => [
    primaryKey({ columns: [t.purchaseId, t.itemId] })
  ]);
export type ShoppingPurchaseItem = typeof shoppingPurchaseItem.$inferSelect;

export const shoppingPurchaseItemRelations = relations(shoppingPurchaseItem, ({ one }) => ({
  shoppingPurchase: one(shoppingPurchase, {
    fields: [shoppingPurchaseItem.purchaseId],
    references: [shoppingPurchase.id]
  }),
  shoppingItem: one(shoppingItem, {
    fields: [shoppingPurchaseItem.itemId],
    references: [shoppingItem.id]
  })
}));

export const stagedShoppingPurchaseItem = pgTable('staged_shopping_purchase_item', {
  itemId: text().primaryKey().references(() => shoppingItem.id, { onDelete: 'cascade' }),
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const stagedShoppingList = pgTable('staged_shopping_list', {
  id: text().primaryKey(),
  userId: text().notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  status: text({ enum: ['validating', 'categorizing'] }).notNull()
});
export type StagedShoppingList = typeof stagedShoppingList.$inferSelect;

export const stagedShoppingListRelations = relations(stagedShoppingList, ({ one, many }) => ({
  user: one(user, { fields: [stagedShoppingList.userId], references: [user.id] }),
  stagedItems: many(stagedShoppingItem)
}));

export const stagedShoppingItem = pgTable('staged_shopping_item', {
  id: text().primaryKey(),
  listId: text().notNull().references(() => stagedShoppingList.id, { onDelete: 'cascade' }),
  status: text({ enum: ['perfect_match', 'unmatched'] }).notNull(),
  name: text().notNull(),
  amount: text().notNull(),
  // FK to shopping_item, non-null only if status is 'perfect_match'
  matchedItemId: text().references(() => shoppingItem.id),
  // FK to shopping_item, non-null only if status is 'close_match'
  suggestedItemId: text().references(() => shoppingItem.id),
  // FK to shopping_category, non-null but must be set later in status 'unmatched'
  selectedCategoryId: text().references(() => shoppingCategory.id)
});
export type StagedShoppingItem = typeof stagedShoppingItem.$inferSelect;

export const stagedShoppingItemRelations = relations(stagedShoppingItem, ({ one }) => ({
  // Each staged item belongs to one staged list
  list: one(stagedShoppingList, { fields: [stagedShoppingItem.listId], references: [stagedShoppingList.id] }),
  // Link to the actual item if it was a perfect match
  matchedItem: one(shoppingItem, {
    fields: [stagedShoppingItem.matchedItemId],
    references: [shoppingItem.id],
    relationName: 'matchedItem' // Explicit name helps Drizzle distinguish
  }),
  // Link to the suggested item if it was a close match
  suggestedItem: one(shoppingItem, {
    fields: [stagedShoppingItem.suggestedItemId],
    references: [shoppingItem.id],
    relationName: 'suggestedItem' // Explicit name
  }),
  // Link to the selected category if it was already done by the user
  selectedCategory: one(shoppingCategory, {
    fields: [stagedShoppingItem.selectedCategoryId],
    references: [shoppingCategory.id],
    relationName: 'selectedCategory' // Explicit name
  })
}));

// ============================================================================
// FINANCES
// ============================================================================

export const balanceEntry = pgTable('balance_entry', {
  id: text().primaryKey(),
  householdId: text()
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' })
    .default(sql`current_setting('app.current_household_id')`),
  date: timestamp().notNull(),
  userId: text().notNull().references(() => user.id),
  price: integer().notNull(),
  name: text()
}, () => [
  pgPolicy('isolate_households', {
    for: 'all',
    using: sql`household_id = current_setting('app.current_household_id', true)`
  })
]).enableRLS();
export type BalanceEntry = typeof balanceEntry.$inferSelect;

export const balanceEntryRelations = relations(balanceEntry, ({ one, many }) => ({
  household: one(household, { fields: [balanceEntry.householdId], references: [household.id] }),
  user: one(user, { fields: [balanceEntry.userId], references: [user.id] }),
  distributions: many(balanceEntryDistribution)
}));

export const balanceEntryDistribution = pgTable('balance_entry_distribution', {
    entryId: text().notNull().references(() => balanceEntry.id, { onDelete: 'cascade' }),
    userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
    percent: doublePrecision().notNull()
  },
  (t) => [
    primaryKey({ columns: [t.entryId, t.userId] })
  ]
);

export const balanceEntryDistributionRelations = relations(balanceEntryDistribution, ({ one }) => ({
  balanceEntry: one(balanceEntry, {
    fields: [balanceEntryDistribution.entryId],
    references: [balanceEntry.id]
  }),
  user: one(user, {
    fields: [balanceEntryDistribution.userId],
    references: [user.id]
  })
}));

// ============================================================================
// TASKS
// ============================================================================

export const weekdayEnum = pgEnum('weekday', Weekday);
export const taskTypeEnum = pgEnum('task_type', TaskType);
export const assignmentEnum = pgEnum('assignment', Assignment);

export const task = pgTable('task', {
  id: text().primaryKey(),
  householdId: text()
    .notNull()
    .references(() => household.id, { onDelete: 'cascade' })
    .default(sql`current_setting('app.current_household_id')`),
  createdAt: timestamp().defaultNow().notNull(),
  type: taskTypeEnum().notNull(),
  name: text().notNull(),
  dueUserId: text().references(() => user.id, { onDelete: 'cascade' }),
  dueDate: date(),
  done: boolean().default(false),
  // Only relevant for repeating tasks
  dueWeekday: weekdayEnum(),
  dueInterval: integer(),
  assignment: assignmentEnum(),
  endDate: date()
}, (table) => [
  pgPolicy('isolate_households', {
    for: 'all',
    using: sql`household_id = current_setting('app.current_household_id', true)`
  }),
  check(
    'task_state_check',
    sql`
      (${table.type} = 'single' AND ${table.dueWeekday} IS NULL AND ${table.dueInterval} IS NULL AND ${table.assignment} IS NULL AND ${table.endDate} IS NULL)
      OR
      (${table.type} = 'repeating' AND ${table.dueWeekday} IS NOT NULL AND ${table.dueInterval} IS NOT NULL AND ${table.dueDate} IS NOT NULL AND ${table.assignment} IS NOT NULL)
    `
  )
]).enableRLS();

export type Task = typeof task.$inferSelect;

export const taskCompletion = pgTable('task_completion', {
  id: text().primaryKey(),
  taskId: text().notNull().references(() => task.id, { onDelete: 'cascade' }),
  userId: text().references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: date().notNull()
});

export type TaskCompletion = typeof taskCompletion.$inferSelect;

export const taskRelations = relations(task, ({ one, many }) => ({
  household: one(household, { fields: [task.householdId], references: [household.id] }),
  dueUser: one(user, { fields: [task.dueUserId], references: [user.id] }),
  completions: many(taskCompletion) // Technically repeating only, but tied to base table
}));

export const taskCompletionRelations = relations(taskCompletion, ({ one }) => ({
  task: one(task, { fields: [taskCompletion.taskId], references: [task.id] })
}));

// Strict generic relation type encompassing the discriminated union
export type TaskWithRelation = Task & {
  dueUser: InferSelectModel<typeof user> | null;
  completions: TaskCompletion[];
};
