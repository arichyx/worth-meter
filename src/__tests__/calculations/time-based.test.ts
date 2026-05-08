import { describe, expect, it } from 'vitest';
import { calculateTimeBased } from '@/lib/calculations/time-based';
import type { Asset } from '@/lib/db/schema';

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 'test-3',
    name: 'MacBook Pro',
    type: 'time',
    totalCost: 14999,
    purchaseDate: '2024-01-01',
    expiryDate: null,
    targetUnitCost: null,
    targetDailyCost: 50,
    resaleValue: 5000,
    billingCycleStart: null,
    billingCycleEnd: null,
    archivedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateTimeBased', () => {
  it('calculates days since purchase', () => {
    const result = calculateTimeBased(makeAsset());
    expect(result.daysSincePurchase).toBeGreaterThan(0);
  });

  it('calculates daily cost with resale value', () => {
    const asset = makeAsset({
      purchaseDate: new Date(Date.now() - 100 * 86400000).toISOString().split('T')[0],
    });
    const result = calculateTimeBased(asset);
    // effective cost = 14999 - 5000 = 9999, days = 100
    expect(result.effectiveCost).toBe(9999);
    expect(result.dailyCost).toBeCloseTo(99.99, 1);
  });

  it('calculates daily cost without resale value', () => {
    const asset = makeAsset({
      resaleValue: null,
      purchaseDate: new Date(Date.now() - 100 * 86400000).toISOString().split('T')[0],
    });
    const result = calculateTimeBased(asset);
    expect(result.effectiveCost).toBe(14999);
    expect(result.dailyCost).toBeCloseTo(149.99, 1);
  });

  it('calculates target days from target daily cost', () => {
    const asset = makeAsset({
      purchaseDate: new Date(Date.now() - 100 * 86400000).toISOString().split('T')[0],
    });
    const result = calculateTimeBased(asset);
    // targetDays = 9999 / 50 = 200
    expect(result.targetDays).toBe(200);
  });

  it('calculates break-even progress', () => {
    const asset = makeAsset({
      purchaseDate: new Date(Date.now() - 100 * 86400000).toISOString().split('T')[0],
    });
    const result = calculateTimeBased(asset);
    // days=100, target=200, progress=0.5
    expect(result.breakEvenProgress).toBe(0.5);
  });

  it('marks as break-even when target days reached', () => {
    const asset = makeAsset({
      purchaseDate: new Date(Date.now() - 250 * 86400000).toISOString().split('T')[0],
    });
    const result = calculateTimeBased(asset);
    expect(result.isBreakEven).toBe(true);
  });

  it('returns null targets when no target daily cost', () => {
    const result = calculateTimeBased(makeAsset({ targetDailyCost: null }));
    expect(result.targetDays).toBeNull();
    expect(result.breakEvenProgress).toBeNull();
    expect(result.isBreakEven).toBe(false);
  });

  it('ensures minimum 1 day since purchase', () => {
    const asset = makeAsset({ purchaseDate: new Date().toISOString().split('T')[0] });
    const result = calculateTimeBased(asset);
    expect(result.daysSincePurchase).toBe(1);
  });
});
