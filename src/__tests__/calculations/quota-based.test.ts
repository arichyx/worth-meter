import { describe, expect, it } from 'vitest';
import { calculateQuotaBased } from '@/lib/calculations/quota-based';
import type { Asset, UsageRecord } from '@/lib/db/schema';

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 'test-2',
    name: 'GPT Plus',
    type: 'quota',
    totalCost: 140,
    purchaseDate: '2025-01-01',
    expiryDate: null,
    targetUnitCost: null,
    targetDailyCost: null,
    resaleValue: null,
    billingCycleStart: '2025-05-01',
    billingCycleEnd: '2025-06-01',
    archivedAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeRecord(remainingBeforeReset: number): UsageRecord {
  return {
    id: `rec-${Math.random()}`,
    assetId: 'test-2',
    value: remainingBeforeReset,
    recordedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

describe('calculateQuotaBased', () => {
  it('returns zero usage when no records exist', () => {
    const result = calculateQuotaBased(makeAsset(), []);
    expect(result.totalUsedWeeklyQuota).toBe(0);
    expect(result.usageRatio).toBe(0);
    expect(result.estimatedValue).toBe(0);
  });

  it('calculates billing cycle days from dates', () => {
    const result = calculateQuotaBased(makeAsset(), []);
    expect(result.billingCycleDays).toBe(31);
  });

  it('calculates expected weekly quota', () => {
    const result = calculateQuotaBased(makeAsset(), []);
    // 31 days / 7 = ~4.43
    expect(result.expectedWeeklyQuota).toBeCloseTo(4.43, 1);
  });

  it('calculates usage from remaining percentages', () => {
    // Two resets: 40% remaining (used 60%), 0% remaining (used 100%)
    const records = [makeRecord(40), makeRecord(0)];
    const result = calculateQuotaBased(makeAsset(), records);
    // 0.6 + 1.0 = 1.6
    expect(result.totalUsedWeeklyQuota).toBe(1.6);
  });

  it('calculates usage ratio correctly', () => {
    // 4 full uses out of ~4.43 expected
    const records = [makeRecord(0), makeRecord(0), makeRecord(0), makeRecord(0)];
    const result = calculateQuotaBased(makeAsset(), records);
    expect(result.usageRatio).toBeCloseTo(4 / (31 / 7), 2);
  });

  it('caps estimated value at total cost', () => {
    // More usage than expected
    const records = Array.from({ length: 10 }, () => makeRecord(0));
    const result = calculateQuotaBased(makeAsset(), records);
    expect(result.estimatedValue).toBe(140);
  });

  it('defaults to 30 days when no billing cycle dates', () => {
    const result = calculateQuotaBased(
      makeAsset({ billingCycleStart: null, billingCycleEnd: null }),
      [],
    );
    expect(result.billingCycleDays).toBe(30);
  });
});
