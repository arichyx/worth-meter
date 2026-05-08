import path from 'node:path';
import Database from 'better-sqlite3';
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const DB_PATH = path.join(process.cwd(), 'worth-meter.db');

const globalForDb = globalThis as unknown as {
  _sqlite: Database.Database | undefined;
  _seeded: boolean | undefined;
};

let drizzleDb: BetterSQLite3Database<typeof schema> | null = null;

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS assets (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    total_cost real NOT NULL,
    purchase_date text NOT NULL,
    expiry_date text,
    target_unit_cost real,
    target_daily_cost real,
    resale_value real,
    billing_cycle_start text,
    billing_cycle_end text,
    created_at text NOT NULL,
    updated_at text NOT NULL
  );
  CREATE TABLE IF NOT EXISTS usage_records (
    id text PRIMARY KEY NOT NULL,
    asset_id text NOT NULL,
    value real NOT NULL,
    recorded_at text NOT NULL,
    created_at text NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE cascade
  );
`;

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (drizzleDb) return drizzleDb;

  let sqlite = globalForDb._sqlite;
  if (!sqlite) {
    sqlite = new Database(DB_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    globalForDb._sqlite = sqlite;
  }

  drizzleDb = drizzle(sqlite, { schema });

  // Ensure tables exist
  sqlite.exec(CREATE_TABLES_SQL);

  return drizzleDb;
}

export function seedIfNeeded() {
  if (globalForDb._seeded) return;
  globalForDb._seeded = true;

  const db = getDb();
  const existing = db.select().from(schema.assets).get();
  if (existing) return;

  const now = new Date().toISOString();
  const SEED_ASSETS: schema.NewAsset[] = [
    {
      id: 'seed-swimming',
      name: '游泳季卡 / Swimming Pass',
      type: 'count',
      totalCost: 1200,
      purchaseDate: '2025-03-01',
      expiryDate: '2025-08-31',
      targetUnitCost: 60,
    },
    {
      id: 'seed-gpt',
      name: 'GPT Plus',
      type: 'quota',
      totalCost: 140,
      purchaseDate: '2025-04-15',
      billingCycleStart: '2025-05-01',
      billingCycleEnd: '2025-06-01',
    },
    {
      id: 'seed-macbook',
      name: 'MacBook Pro',
      type: 'time',
      totalCost: 14999,
      purchaseDate: '2024-01-15',
      targetDailyCost: 50,
      resaleValue: 5000,
    },
    {
      id: 'seed-gym',
      name: '健身年卡 / Gym Membership',
      type: 'count',
      totalCost: 3600,
      purchaseDate: '2025-01-01',
      expiryDate: '2025-12-31',
      targetUnitCost: 100,
    },
    {
      id: 'seed-ipad',
      name: 'iPad Pro',
      type: 'time',
      totalCost: 8999,
      purchaseDate: '2024-06-01',
      targetDailyCost: 30,
      resaleValue: 3000,
    },
  ];
  const SEED_RECORDS: schema.NewUsageRecord[] = [
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `seed-swim-${i}`,
      assetId: 'seed-swimming',
      value: 1,
      recordedAt: new Date(2025, 2, (i % 28) + 1).toISOString(),
    })),
    ...[
      { remaining: 40, date: '2025-05-07' },
      { remaining: 0, date: '2025-05-14' },
      { remaining: 80, date: '2025-05-21' },
      { remaining: 20, date: '2025-05-28' },
    ].map((r, i) => ({
      id: `seed-gpt-${i}`,
      assetId: 'seed-gpt',
      value: r.remaining,
      recordedAt: new Date(r.date).toISOString(),
    })),
    ...Array.from({ length: 28 }, (_, i) => ({
      id: `seed-gym-${i}`,
      assetId: 'seed-gym',
      value: 1,
      recordedAt: new Date(2025, Math.floor(i / 10), (i % 28) + 1).toISOString(),
    })),
  ];

  for (const asset of SEED_ASSETS) {
    db.insert(schema.assets)
      .values({ ...asset, createdAt: now, updatedAt: now })
      .run();
  }
  for (const record of SEED_RECORDS) {
    db.insert(schema.usageRecords)
      .values({ ...record, createdAt: now })
      .run();
  }
}

export { schema };
