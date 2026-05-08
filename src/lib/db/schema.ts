import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type AssetType = 'time' | 'count' | 'quota';

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['time', 'count', 'quota'] }).notNull(),
  totalCost: real('total_cost').notNull(),
  purchaseDate: text('purchase_date').notNull(),
  expiryDate: text('expiry_date'),
  targetUnitCost: real('target_unit_cost'),
  targetDailyCost: real('target_daily_cost'),
  resaleValue: real('resale_value'),
  billingCycleStart: text('billing_cycle_start'),
  billingCycleEnd: text('billing_cycle_end'),
  archivedAt: text('archived_at'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const usageRecords = sqliteTable('usage_records', {
  id: text('id').primaryKey(),
  assetId: text('asset_id')
    .notNull()
    .references(() => assets.id, { onDelete: 'cascade' }),
  // For count-based: value=1 (one use)
  // For quota-based: value=remaining percentage (0-100) before reset
  value: real('value').notNull(),
  recordedAt: text('recorded_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type UsageRecord = typeof usageRecords.$inferSelect;
export type NewUsageRecord = typeof usageRecords.$inferInsert;
