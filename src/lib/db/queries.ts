import { eq, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { cache } from 'react';
import { assertCanAddUsageRecord } from '@/lib/usage-record-policy';
import { getDb, schema, seedIfNeeded } from './index';
import type { NewAsset } from './schema';

export const getAllAssetsWithRecords = cache(() => {
  seedIfNeeded();
  const db = getDb();
  const allAssets = db.select().from(schema.assets).all();
  if (allAssets.length === 0) return [];

  // Single query for all usage records, grouped in memory (was N+1).
  const ids = allAssets.map((a) => a.id);
  const allRecords = db
    .select()
    .from(schema.usageRecords)
    .where(inArray(schema.usageRecords.assetId, ids))
    .all();
  const byAsset = new Map<string, typeof allRecords>();
  for (const r of allRecords) {
    const list = byAsset.get(r.assetId) ?? [];
    list.push(r);
    byAsset.set(r.assetId, list);
  }
  return allAssets.map((asset) => ({
    ...asset,
    usageRecords: byAsset.get(asset.id) ?? [],
  }));
});

export function getAssetWithRecords(id: string) {
  seedIfNeeded();
  const db = getDb();
  const asset = db.select().from(schema.assets).where(eq(schema.assets.id, id)).get();
  if (!asset) return null;
  const records = db
    .select()
    .from(schema.usageRecords)
    .where(eq(schema.usageRecords.assetId, id))
    .all();
  return { ...asset, usageRecords: records };
}

export function createAsset(data: Omit<NewAsset, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb();
  const id = nanoid();
  const now = new Date().toISOString();
  db.insert(schema.assets)
    .values({ ...data, id, createdAt: now, updatedAt: now })
    .run();
  return db.select().from(schema.assets).where(eq(schema.assets.id, id)).get();
}

export function updateAsset(id: string, data: Partial<Omit<NewAsset, 'id' | 'createdAt'>>) {
  const db = getDb();
  db.update(schema.assets)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.assets.id, id))
    .run();
}

export function deleteAsset(id: string) {
  const db = getDb();
  db.delete(schema.assets).where(eq(schema.assets.id, id)).run();
}

export function archiveAsset(id: string) {
  const db = getDb();
  db.update(schema.assets)
    .set({ archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(schema.assets.id, id))
    .run();
}

export function unarchiveAsset(id: string) {
  const db = getDb();
  db.update(schema.assets)
    .set({ archivedAt: null, updatedAt: new Date().toISOString() })
    .where(eq(schema.assets.id, id))
    .run();
}

export function addUsageRecord(assetId: string, value: number, recordedAt?: string) {
  const db = getDb();
  const asset = db
    .select({ type: schema.assets.type, archivedAt: schema.assets.archivedAt })
    .from(schema.assets)
    .where(eq(schema.assets.id, assetId))
    .get();
  assertCanAddUsageRecord(asset);

  const id = nanoid();
  const now = new Date().toISOString();
  db.insert(schema.usageRecords)
    .values({ id, assetId, value, recordedAt: recordedAt ?? now, createdAt: now })
    .run();
  return db.select().from(schema.usageRecords).where(eq(schema.usageRecords.id, id)).get();
}

export function deleteUsageRecord(id: string) {
  const db = getDb();
  db.delete(schema.usageRecords).where(eq(schema.usageRecords.id, id)).run();
}
