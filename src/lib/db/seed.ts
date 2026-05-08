import { getDb, schema } from './index';
import type { NewAsset, NewUsageRecord } from './schema';

const SEED_ASSETS: NewAsset[] = [
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

const SEED_RECORDS: NewUsageRecord[] = [
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

export function seedIfNeeded() {
  const db = getDb();
  const existing = db.select().from(schema.assets).get();
  if (existing) return;

  const now = new Date().toISOString();
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
