import { describe, expect, it } from 'vitest';
import {
  calculateCountBased,
  calculateCountBasedFromUsedCount,
} from '@/lib/calculations/count-based';
import type { Asset, UsageRecord } from '@/lib/db/schema';

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 'test-1',
    name: 'Swimming Pass',
    type: 'count',
    totalCost: 1200,
    purchaseDate: '2025-01-01',
    expiryDate: '2025-06-30',
    targetUnitCost: 60,
    targetDailyCost: null,
    resaleValue: null,
    billingCycleStart: null,
    billingCycleEnd: null,
    archivedAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeRecords(count: number): UsageRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `rec-${i}`,
    assetId: 'test-1',
    value: 1,
    recordedAt: new Date(2025, 0, i + 1).toISOString(),
    createdAt: new Date(2025, 0, i + 1).toISOString(),
  }));
}

describe('calculateCountBased', () => {
  it('returns 0 uses when no records exist', () => {
    const result = calculateCountBased(makeAsset(), []);
    expect(result.usedCount).toBe(0);
    expect(result.costPerUse).toBe(1200);
  });

  it('calculates cost per use correctly', () => {
    const result = calculateCountBased(makeAsset(), makeRecords(10));
    expect(result.usedCount).toBe(10);
    expect(result.costPerUse).toBe(120);
  });

  it('calculates target use count from target unit cost', () => {
    const result = calculateCountBased(makeAsset(), makeRecords(10));
    expect(result.targetUseCount).toBe(20);
  });

  it('calculates break-even progress', () => {
    const result = calculateCountBased(makeAsset(), makeRecords(10));
    expect(result.breakEvenProgress).toBe(0.5);
  });

  it('marks as break-even when target is reached', () => {
    const result = calculateCountBased(makeAsset(), makeRecords(20));
    expect(result.isBreakEven).toBe(true);
    expect(result.breakEvenProgress).toBe(1);
  });

  it('caps break-even progress at 1', () => {
    const result = calculateCountBased(makeAsset(), makeRecords(30));
    expect(result.breakEvenProgress).toBe(1);
  });

  it('returns null targets when no target unit cost set', () => {
    const result = calculateCountBased(makeAsset({ targetUnitCost: null }), makeRecords(5));
    expect(result.targetUseCount).toBeNull();
    expect(result.breakEvenProgress).toBeNull();
    expect(result.isBreakEven).toBe(false);
  });

  it('uses the same calculation when only a projected use count is available', () => {
    const asset = makeAsset();
    expect(calculateCountBasedFromUsedCount(asset, 10)).toEqual(
      calculateCountBased(asset, makeRecords(10)),
    );
  });
});
