import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildValueInsights, rankAssetsByObservedValue } from '@/lib/calculations/leaderboard';
import type { Asset, AssetType, UsageRecord } from '@/lib/db/schema';

interface AssetWithRecords extends Asset {
  usageRecords: UsageRecord[];
}

function makeAsset(type: AssetType, overrides: Partial<AssetWithRecords> = {}): AssetWithRecords {
  return {
    id: 'a',
    name: 'Asset',
    type,
    totalCost: 1000,
    purchaseDate: '2025-01-01',
    expiryDate: null,
    targetUnitCost: null,
    targetDailyCost: null,
    resaleValue: null,
    billingCycleStart: null,
    billingCycleEnd: null,
    archivedAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    usageRecords: [],
    ...overrides,
  } as AssetWithRecords;
}

function countRecords(n: number, assetId = 'a'): UsageRecord[] {
  return Array.from({ length: n }, (_, index) => ({
    id: `${assetId}-r-${index}`,
    assetId,
    value: 1,
    recordedAt: '2025-02-01T00:00:00.000Z',
    createdAt: '2025-02-01T00:00:00.000Z',
  }));
}

function quotaRecords(usedPercentages: number[], assetId: string): UsageRecord[] {
  return usedPercentages.map((used, index) => ({
    id: `${assetId}-q-${index}`,
    assetId,
    value: 100 - used,
    recordedAt: '2025-02-01T00:00:00.000Z',
    createdAt: '2025-02-01T00:00:00.000Z',
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-04-11T00:00:00.000Z'));
});

describe('rankAssetsByObservedValue', () => {
  it('ranks used count assets by cost per use without requiring targets', () => {
    const assets = [
      makeAsset('count', {
        id: 'five-uses',
        totalCost: 1000,
        usageRecords: countRecords(5, 'five-uses'),
      }),
      makeAsset('count', {
        id: 'ten-uses',
        totalCost: 1000,
        usageRecords: countRecords(10, 'ten-uses'),
      }),
    ];

    const ranked = rankAssetsByObservedValue(assets, 'count');

    expect(ranked.map((item) => item.asset.id)).toEqual(['ten-uses', 'five-uses']);
    expect(ranked.map((item) => item.rank)).toEqual([1, 2]);
    expect(ranked.map((item) => item.primaryMetric)).toEqual([100, 200]);
    expect(ranked.every((item) => item.targetProgress === null)).toBe(true);
  });

  it('keeps target progress as secondary data without changing count order', () => {
    const assets = [
      makeAsset('count', {
        id: 'better-value-no-target',
        totalCost: 1000,
        usageRecords: countRecords(20, 'better-value-no-target'),
      }),
      makeAsset('count', {
        id: 'worse-value-with-target',
        totalCost: 1000,
        targetUnitCost: 100,
        usageRecords: countRecords(5, 'worse-value-with-target'),
      }),
    ];

    const ranked = rankAssetsByObservedValue(assets, 'count');

    expect(ranked[0].asset.id).toBe('better-value-no-target');
    expect(ranked[0].targetProgress).toBeNull();
    expect(ranked[1].targetProgress).toBe(0.5);
  });

  it('puts zero-use count assets after numbered ranks', () => {
    const ranked = rankAssetsByObservedValue(
      [
        makeAsset('count', {
          id: 'unused',
          totalCost: 100,
          usageRecords: [],
        }),
        makeAsset('count', {
          id: 'used',
          totalCost: 1000,
          usageRecords: countRecords(1, 'used'),
        }),
      ],
      'count',
    );

    expect(ranked.map((item) => item.asset.id)).toEqual(['used', 'unused']);
    expect(ranked.map((item) => item.rank)).toEqual([1, null]);
    expect(ranked[1].status).toBe('waitingForUsage');
  });

  it('ranks time assets by holding cost per day ascending', () => {
    const ranked = rankAssetsByObservedValue(
      [
        makeAsset('time', {
          id: 'expensive-per-day',
          totalCost: 1000,
          purchaseDate: '2025-04-01',
        }),
        makeAsset('time', {
          id: 'cheap-per-day',
          totalCost: 1000,
          purchaseDate: '2025-01-01',
        }),
      ],
      'time',
    );

    expect(ranked.map((item) => item.asset.id)).toEqual(['cheap-per-day', 'expensive-per-day']);
    expect(ranked.map((item) => item.rank)).toEqual([1, 2]);
  });

  it('ranks quota assets by usage ratio descending', () => {
    const base = {
      totalCost: 240,
      billingCycleStart: '2025-01-01',
      billingCycleEnd: '2025-01-29',
    };
    const ranked = rankAssetsByObservedValue(
      [
        makeAsset('quota', {
          ...base,
          id: 'low',
          usageRecords: quotaRecords([25], 'low'),
        }),
        makeAsset('quota', {
          ...base,
          id: 'high',
          usageRecords: quotaRecords([100, 100], 'high'),
        }),
      ],
      'quota',
    );

    expect(ranked.map((item) => item.asset.id)).toEqual(['high', 'low']);
    expect(ranked[0].primaryMetric).toBeGreaterThan(ranked[1].primaryMetric);
  });

  it('breaks equal metrics by lower total cost and then asset id', () => {
    const ranked = rankAssetsByObservedValue(
      [
        makeAsset('count', {
          id: 'z',
          totalCost: 500,
          usageRecords: countRecords(5, 'z'),
        }),
        makeAsset('count', {
          id: 'b',
          totalCost: 200,
          usageRecords: countRecords(2, 'b'),
        }),
        makeAsset('count', {
          id: 'a',
          totalCost: 200,
          usageRecords: countRecords(2, 'a'),
        }),
      ],
      'count',
    );

    expect(ranked.map((item) => item.asset.id)).toEqual(['a', 'b', 'z']);
  });

  it('filters out archived and other-type assets', () => {
    const ranked = rankAssetsByObservedValue(
      [
        makeAsset('count', {
          id: 'active',
          usageRecords: countRecords(1, 'active'),
        }),
        makeAsset('count', {
          id: 'archived',
          archivedAt: '2025-03-01T00:00:00.000Z',
          usageRecords: countRecords(10, 'archived'),
        }),
        makeAsset('time', { id: 'other-type' }),
      ],
      'count',
    );

    expect(ranked.map((item) => item.asset.id)).toEqual(['active']);
  });
});

describe('buildValueInsights', () => {
  it('selects one best-value asset for every available type', () => {
    const insights = buildValueInsights([
      makeAsset('time', {
        id: 'time-best',
        totalCost: 100,
        purchaseDate: '2025-01-01',
      }),
      makeAsset('time', {
        id: 'time-attention',
        totalCost: 1000,
        purchaseDate: '2025-04-01',
      }),
      makeAsset('count', {
        id: 'count-best',
        usageRecords: countRecords(10, 'count-best'),
      }),
      makeAsset('count', {
        id: 'count-attention',
        usageRecords: countRecords(1, 'count-attention'),
      }),
    ]);

    expect(insights.find((item) => item.type === 'time')?.best?.asset.id).toBe('time-best');
    expect(insights.find((item) => item.type === 'count')?.best?.asset.id).toBe('count-best');
    expect(insights.find((item) => item.type === 'quota')?.best).toBeNull();
  });

  it('prioritizes an unrecorded count asset for attention', () => {
    const insight = buildValueInsights([
      makeAsset('count', {
        id: 'used',
        usageRecords: countRecords(3, 'used'),
      }),
      makeAsset('count', {
        id: 'unused',
        usageRecords: [],
      }),
    ]).find((item) => item.type === 'count');

    expect(insight?.attention?.asset.id).toBe('unused');
    expect(insight?.attentionReason).toBe('waitingForUsage');
  });

  it('uses the inverse native metric as the attention insight', () => {
    const insights = buildValueInsights([
      makeAsset('time', {
        id: 'time-best',
        totalCost: 100,
        purchaseDate: '2025-01-01',
      }),
      makeAsset('time', {
        id: 'time-high-cost',
        totalCost: 1000,
        purchaseDate: '2025-04-01',
      }),
      makeAsset('count', {
        id: 'count-best',
        totalCost: 100,
        usageRecords: countRecords(10, 'count-best'),
      }),
      makeAsset('count', {
        id: 'count-high-cost',
        totalCost: 1000,
        usageRecords: countRecords(1, 'count-high-cost'),
      }),
    ]);

    const time = insights.find((item) => item.type === 'time');
    const count = insights.find((item) => item.type === 'count');
    expect(time?.attention?.asset.id).toBe('time-high-cost');
    expect(time?.attentionReason).toBe('highestHoldingCost');
    expect(count?.attention?.asset.id).toBe('count-high-cost');
    expect(count?.attentionReason).toBe('highestCostPerUse');
  });

  it('does not repeat a single asset as both best and attention', () => {
    const insight = buildValueInsights([makeAsset('time', { id: 'only' })]).find(
      (item) => item.type === 'time',
    );

    expect(insight?.best?.asset.id).toBe('only');
    expect(insight?.attention).toBeNull();
    expect(insight?.attentionReason).toBeNull();
  });
});
