import { describe, expect, it } from 'vitest';
import { deriveNudges, NUDGE_STALE_DAYS } from '@/lib/calculations/nudges';
import type { Asset, AssetType, UsageRecord } from '@/lib/db/schema';

interface AssetWithRecords extends Asset {
  usageRecords: UsageRecord[];
}

const NOW = '2026-07-18T00:00:00.000Z';

function makeCount(overrides: Partial<AssetWithRecords> = {}): AssetWithRecords {
  return {
    id: 'c',
    name: 'Gym Pass',
    type: 'count',
    totalCost: 1000,
    purchaseDate: '2026-01-01',
    expiryDate: null,
    targetUnitCost: 50,
    targetDailyCost: null,
    resaleValue: null,
    billingCycleStart: null,
    billingCycleEnd: null,
    archivedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    usageRecords: [],
    ...overrides,
  } as AssetWithRecords;
}

function rec(recordedAt: string): UsageRecord {
  return { id: 'r', assetId: 'c', value: 1, recordedAt, createdAt: recordedAt };
}

describe('deriveNudges', () => {
  it('flags a stale, non-broke-even count asset', () => {
    // last use 30 days ago, target 20 uses, only 5 used -> not broke even
    const a = makeCount({
      id: 'stale',
      targetUnitCost: 50,
      totalCost: 1000,
      usageRecords: [rec('2026-06-18T00:00:00.000Z')],
    });
    const nudges = deriveNudges([a], NOW);
    expect(nudges).toHaveLength(1);
    expect(nudges[0].assetId).toBe('stale');
    expect(nudges[0].daysSinceLastUse).toBe(30);
  });

  it('does not flag a recently-logged asset', () => {
    const a = makeCount({ usageRecords: [rec('2026-07-16T00:00:00.000Z')] }); // 2 days ago
    expect(deriveNudges([a], NOW)).toHaveLength(0);
  });

  it('does not flag a broken-even asset even when stale', () => {
    const a = makeCount({
      targetUnitCost: 50,
      totalCost: 100, // target 2 uses
      usageRecords: [rec('2026-01-01T00:00:00.000Z'), rec('2026-01-02T00:00:00.000Z')], // 2 uses -> broke even
    });
    expect(deriveNudges([a], NOW)).toHaveLength(0);
  });

  it('falls back to purchase date when there are no usage records', () => {
    const a = makeCount({ purchaseDate: '2026-01-01', usageRecords: [] });
    const nudges = deriveNudges([a], NOW);
    expect(nudges).toHaveLength(1);
    // days since 2026-01-01 to 2026-07-18
    expect(nudges[0].daysSinceLastUse).toBeGreaterThan(NUDGE_STALE_DAYS);
  });

  it('ignores non-count assets', () => {
    const a = makeCount({ type: 'time' as AssetType, usageRecords: [] });
    expect(deriveNudges([a], NOW)).toHaveLength(0);
  });

  it('ignores archived count assets', () => {
    const a = makeCount({ archivedAt: '2026-06-01T00:00:00.000Z', usageRecords: [] });
    expect(deriveNudges([a], NOW)).toHaveLength(0);
  });

  it('uses the most recent usage record, not the first', () => {
    const a = makeCount({
      usageRecords: [rec('2026-01-01T00:00:00.000Z'), rec('2026-07-16T00:00:00.000Z')], // recent -> not stale
    });
    expect(deriveNudges([a], NOW)).toHaveLength(0);
  });

  it('returns empty for no assets', () => {
    expect(deriveNudges([], NOW)).toEqual([]);
  });
});
