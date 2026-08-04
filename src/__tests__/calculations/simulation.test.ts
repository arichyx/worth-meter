import { differenceInDays } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { calculateCountBased } from '@/lib/calculations/count-based';
import {
  deriveHistoricalVelocity,
  SIM_HORIZON_DAYS,
  type SimulationInput,
  simulatePurchase,
  type TrackRecord,
} from '@/lib/calculations/simulation';
import type { Asset, AssetType, UsageRecord } from '@/lib/db/schema';

const NOW = '2026-07-18T00:00:00.000Z';
const PURCHASE_100D_AGO = '2026-04-09'; // 100 days before 2026-07-18

function makeAsset(
  type: AssetType,
  overrides: Partial<Asset & { usageRecords: UsageRecord[] }> = {},
): Asset & { usageRecords: UsageRecord[] } {
  return {
    id: 'a-1',
    name: 'Test Asset',
    type,
    totalCost: 1200,
    purchaseDate: PURCHASE_100D_AGO,
    expiryDate: null,
    targetUnitCost: null,
    targetDailyCost: null,
    resaleValue: null,
    billingCycleStart: null,
    billingCycleEnd: null,
    archivedAt: null,
    createdAt: '2026-04-09T00:00:00.000Z',
    updatedAt: '2026-04-09T00:00:00.000Z',
    usageRecords: [],
    ...overrides,
  } as Asset & { usageRecords: UsageRecord[] };
}

function records(count: number): UsageRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `r-${i}`,
    assetId: 'a-1',
    value: 1,
    recordedAt: '2026-05-01T00:00:00.000Z',
    createdAt: '2026-05-01T00:00:00.000Z',
  }));
}

function noHistoryTrack(type: AssetType): TrackRecord {
  return {
    type,
    hasHistory: false,
    velocity: null,
    velocityKind: type === 'count' ? 'usesPerDay' : type === 'time' ? 'costPerDay' : 'usageRatio',
    recentAsset: null,
    sampleCount: 0,
  };
}

function input(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    type: 'count',
    totalCost: 1200,
    purchaseDate: '2026-07-18',
    targetUnitCost: 60,
    expectedUsesPerWeek: 3,
    ...overrides,
  };
}

describe('simulatePurchase - engine reuse', () => {
  it('count cost-per-use at a projected use count matches the real calculator', () => {
    const inp = input({ totalCost: 1200, targetUnitCost: 60, expectedUsesPerWeek: 3 });
    const res = simulatePurchase(inp, noHistoryTrack('count'), NOW);
    // 6-month horizon uses = (3/7 uses/day) * 183 days, floored; cost-per-use = totalCost / uses
    const expected6m = calculateCountBased(
      { ...inp, id: 'x', name: 'x', archivedAt: null, createdAt: NOW, updatedAt: NOW } as Asset,
      records(Math.floor((3 / 7) * 183)),
    ).costPerUse;
    expect(res.costPerUnitAt6m).toBeCloseTo(expected6m, 5);
  });

  it('time daily cost at horizon matches effective cost / elapsed days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00.000Z'));

    try {
      const inp = input({
        type: 'time',
        totalCost: 8000,
        resaleValue: 3000,
        targetDailyCost: 20,
        expectedUsesPerWeek: null,
      });
      const res = simulatePurchase(inp, noHistoryTrack('time'), NOW);
      // The injected NOW, rather than the wall clock, defines both horizons.
      expect(res.costPerUnitAt6m).toBeCloseTo(5000 / 183, 2);
      expect(res.costPerUnitAt12m).toBeCloseTo(5000 / 365, 2);
      expect(res.effectiveCost).toBe(5000);
    } finally {
      vi.useRealTimers();
    }
  });

  it('handles very large expected usage without materializing synthetic records', () => {
    const expectedUsesPerWeek = 200_000_000;
    const res = simulatePurchase(input({ expectedUsesPerWeek }), noHistoryTrack('count'), NOW);

    expect(res.costPerUnitAt6m).toBe(1200 / Math.floor((expectedUsesPerWeek / 7) * 183));
    expect(res.costPerUnitAt12m).toBe(1200 / Math.floor((expectedUsesPerWeek / 7) * 365));
  });
});

describe('simulatePurchase - verdict thresholds', () => {
  it('returns worth-it when the projected pace breaks even within the horizon', () => {
    const res = simulatePurchase(
      input({ totalCost: 1200, targetUnitCost: 60, expectedUsesPerWeek: 20 }),
      noHistoryTrack('count'),
      NOW,
    );
    // targetUseCount 20, expected pace 20/week -> 7 days -> well within 365
    expect(res.verdict).toBe('worth-it');
    expect(res.basis).toBe('expected');
  });

  it('returns unlikely when even the stated pace exceeds the horizon', () => {
    const res = simulatePurchase(
      input({ totalCost: 1200, targetUnitCost: 6, expectedUsesPerWeek: 1 }),
      noHistoryTrack('count'),
      NOW,
    );
    // targetUseCount 200, 1/week -> 1400 days > horizon
    expect(res.verdict).toBe('unlikely');
  });

  it('returns on-the-fence when expectation is within horizon but historical pace is not', () => {
    // velocity 0.2 uses/day (derived below); targetUseCount 200 -> velocity break-even 1000 days
    const track: TrackRecord = {
      type: 'count',
      hasHistory: true,
      velocity: 0.2,
      velocityKind: 'usesPerDay',
      recentAsset: null,
      sampleCount: 2,
    };
    const res = simulatePurchase(
      input({ totalCost: 12000, targetUnitCost: 60, expectedUsesPerWeek: 20 }),
      track,
      NOW,
    );
    // expected 200/(20/7)=70 days (within horizon); velocity 200/0.2=1000 days (over)
    expect(res.verdict).toBe('on-the-fence');
    expect(res.basis).toBe('expected');
    expect(res.expectedBreakEvenDays).toBeLessThanOrEqual(SIM_HORIZON_DAYS);
    expect(res.velocityBreakEvenDays!).toBeGreaterThan(SIM_HORIZON_DAYS);
  });

  it('returns unlikely with history when both expectation and pace exceed the horizon', () => {
    const track: TrackRecord = {
      type: 'count',
      hasHistory: true,
      velocity: 0.2,
      velocityKind: 'usesPerDay',
      recentAsset: null,
      sampleCount: 2,
    };
    const res = simulatePurchase(
      input({ totalCost: 12000, targetUnitCost: 60, expectedUsesPerWeek: 1 }),
      track,
      NOW,
    );
    expect(res.verdict).toBe('unlikely');
  });
});

describe('simulatePurchase - empty history fallback', () => {
  it('falls back to expected basis and still classifies', () => {
    const res = simulatePurchase(
      input({ totalCost: 1200, targetUnitCost: 60, expectedUsesPerWeek: 3 }),
      noHistoryTrack('count'),
      NOW,
    );
    expect(res.basis).toBe('expected');
    expect(res.velocityBreakEvenDays).toBeNull();
    expect(res.verdict).not.toBeNull();
  });

  it('returns null verdict when no target and no rate are available', () => {
    const res = simulatePurchase(
      input({ targetUnitCost: null, expectedUsesPerWeek: null }),
      noHistoryTrack('count'),
      NOW,
    );
    expect(res.verdict).toBeNull();
    expect(res.basis).toBe('none');
    expect(res.projectedBreakEvenDays).toBeNull();
  });
});

describe('simulatePurchase - expected input drives headline even with history', () => {
  const track: TrackRecord = {
    type: 'count',
    hasHistory: true,
    velocity: 0.2,
    velocityKind: 'usesPerDay',
    recentAsset: null,
    sampleCount: 2,
  };

  it('uses the expected pace for projected break-even, not the historical velocity', () => {
    // targetUseCount 20, expected 10/week -> 14 days; velocity 0.2/day -> 100 days
    const res = simulatePurchase(
      input({ totalCost: 1200, targetUnitCost: 60, expectedUsesPerWeek: 10 }),
      track,
      NOW,
    );
    expect(res.projectedBreakEvenDays).toBeCloseTo(14, 5);
    expect(res.velocityBreakEvenDays).toBeCloseTo(100, 0);
    expect(res.basis).toBe('expected');
  });

  it('changes the projected break-even when expected uses per week changes', () => {
    const fast = simulatePurchase(
      input({ totalCost: 1200, targetUnitCost: 60, expectedUsesPerWeek: 10 }),
      track,
      NOW,
    );
    const slow = simulatePurchase(
      input({ totalCost: 1200, targetUnitCost: 60, expectedUsesPerWeek: 2 }),
      track,
      NOW,
    );
    expect(slow.projectedBreakEvenDays!).toBeGreaterThan(fast.projectedBreakEvenDays!);
    // 10/week -> 14d; 2/week -> 70d
    expect(fast.projectedBreakEvenDays).toBeCloseTo(14, 5);
    expect(slow.projectedBreakEvenDays).toBeCloseTo(70, 5);
  });

  it('still escalates to on-the-fence when the expected plan beats the horizon but the pace does not', () => {
    const res = simulatePurchase(
      input({ totalCost: 1200, targetUnitCost: 6, expectedUsesPerWeek: 10 }),
      track,
      NOW,
    );
    // targetUseCount 200; expected 200/(10/7)=140d (within horizon); velocity 200/0.2=1000d (over)
    expect(res.verdict).toBe('on-the-fence');
    expect(res.projectedBreakEvenDays).toBeCloseTo(140, 0);
  });
});

describe('deriveHistoricalVelocity', () => {
  it('derives count uses-per-day across non-archived count assets', () => {
    const assets = [
      makeAsset('count', { id: 'a', usageRecords: records(10) }),
      makeAsset('count', {
        id: 'b',
        usageRecords: records(30),
        createdAt: '2026-04-10T00:00:00.000Z',
      }),
    ];
    const track = deriveHistoricalVelocity(assets, 'count', NOW);
    const totalDays = 2 * differenceInDays(new Date(NOW), new Date(PURCHASE_100D_AGO));
    expect(track.velocity).toBeCloseTo(40 / totalDays, 5);
    expect(track.hasHistory).toBe(true);
    expect(track.sampleCount).toBe(2);
    // most recent asset by createdAt is 'b'
    expect(track.recentAsset?.id).toBe('b');
  });

  it('derives time realized cost-per-day across time assets', () => {
    const assets = [
      makeAsset('time', { id: 't', totalCost: 8000, resaleValue: 3000, targetDailyCost: 20 }),
    ];
    const track = deriveHistoricalVelocity(assets, 'time', NOW);
    const days = differenceInDays(new Date(NOW), new Date(PURCHASE_100D_AGO));
    expect(track.velocity).toBeCloseTo(5000 / days, 2);
    expect(track.velocityKind).toBe('costPerDay');
  });

  it('returns graceful empty track when no assets of the type exist', () => {
    const track = deriveHistoricalVelocity([], 'count', NOW);
    expect(track.hasHistory).toBe(false);
    expect(track.velocity).toBeNull();
    expect(track.recentAsset).toBeNull();
    expect(track.sampleCount).toBe(0);
  });

  it('ignores archived assets when computing velocity', () => {
    const assets = [
      makeAsset('count', { id: 'active', usageRecords: records(10) }),
      makeAsset('count', {
        id: 'archived',
        usageRecords: records(100),
        archivedAt: '2026-06-01T00:00:00.000Z',
      }),
    ];
    const track = deriveHistoricalVelocity(assets, 'count', NOW);
    expect(track.sampleCount).toBe(1);
    expect(track.recentAsset?.id).toBe('active');
  });
});
