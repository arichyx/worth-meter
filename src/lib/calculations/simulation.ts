import { addDays, differenceInDays } from 'date-fns';
import type { Asset, AssetType, UsageRecord } from '../db/schema';
import { calculateCountBased, calculateCountBasedFromUsedCount } from './count-based';
import { calculateQuotaBased } from './quota-based';
import { calculateTimeBased } from './time-based';

/** Comparison horizon for the verdict (days). A purchase that breaks even within this window is "worth it". */
export const SIM_HORIZON_DAYS = 365;
const HORIZON_6M_DAYS = 183;
const HORIZON_12M_DAYS = 365;

export type Verdict = 'worth-it' | 'on-the-fence' | 'unlikely';

export interface SimulationInput {
  type: AssetType;
  totalCost: number;
  purchaseDate: string;
  /** count: worth-it threshold ¥/use. */
  targetUnitCost?: number | null;
  /** time: worth-it threshold ¥/day. */
  targetDailyCost?: number | null;
  /** quota: billing window. */
  billingCycleStart?: string | null;
  billingCycleEnd?: string | null;
  /** time: salvage value subtracted from cost. */
  resaleValue?: number | null;
  /** count: optional expiry. */
  expiryDate?: string | null;
  /** count: expected uses per week (user's own estimate). */
  expectedUsesPerWeek?: number | null;
  /** quota: expected usage per cycle as a percentage (0-100). */
  expectedUsageRatio?: number | null;
}

export interface TrackRecordAsset {
  id: string;
  name: string;
  breakEvenProgress: number | null;
  isBreakEven: boolean;
  costPerUnit: number | null;
}

export interface TrackRecord {
  type: AssetType;
  hasHistory: boolean;
  /** count: uses/day · time: realized ¥/day · quota: avg usageRatio per cycle. */
  velocity: number | null;
  velocityKind: 'usesPerDay' | 'costPerDay' | 'usageRatio';
  recentAsset: TrackRecordAsset | null;
  sampleCount: number;
}

export interface SimulationResult {
  verdict: Verdict | null;
  /** Which rate the projection was based on: the user's history, or their stated expectation. */
  basis: 'history' | 'expected' | 'none';
  /** Break-even days under the stated target/expectation (may be null if no rate available). */
  expectedBreakEvenDays: number | null;
  /** Break-even days under the user's historical pace (null when no history). */
  velocityBreakEvenDays: number | null;
  /** The break-even days actually used for the verdict (velocity if available, else expected). */
  projectedBreakEvenDays: number | null;
  projectedBreakEvenDate: string | null;
  costPerUnitAt6m: number | null;
  costPerUnitAt12m: number | null;
  effectiveCost: number;
}

interface AssetWithRecords extends Asset {
  usageRecords: UsageRecord[];
}

function buildSyntheticAsset(
  input: SimulationInput,
  nowIso: string,
  purchaseDateOverride?: string,
): Asset {
  return {
    id: '__sim__',
    name: '__sim__',
    type: input.type,
    totalCost: input.totalCost,
    purchaseDate: purchaseDateOverride ?? input.purchaseDate,
    expiryDate: input.expiryDate ?? null,
    targetUnitCost: input.targetUnitCost ?? null,
    targetDailyCost: input.targetDailyCost ?? null,
    resaleValue: input.resaleValue ?? null,
    billingCycleStart: input.billingCycleStart ?? null,
    billingCycleEnd: input.billingCycleEnd ?? null,
    archivedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

function effectiveCost(input: SimulationInput): number {
  return input.totalCost - (input.resaleValue ?? 0);
}

function daysSince(dateIso: string, nowIso: string): number {
  return Math.max(differenceInDays(new Date(nowIso), new Date(dateIso)), 1);
}

/**
 * Project break-even for a prospective purchase by reusing the existing calculation
 * engine over a synthetic (non-persisted) asset. `nowIso` is injected so the function
 * is pure and testable (no `new Date()` inside).
 */
export function simulatePurchase(
  input: SimulationInput,
  track: TrackRecord,
  nowIso: string,
): SimulationResult {
  const synth = buildSyntheticAsset(input, nowIso);
  const effCost = effectiveCost(input);
  const hasHistory = track.hasHistory && track.velocity != null && track.velocity > 0;

  let targetUseCount: number | null = null;
  let billingCycleDays = 30;
  if (input.type === 'count') {
    targetUseCount = calculateCountBased(synth, []).targetUseCount;
  } else if (input.type === 'quota' && input.billingCycleStart && input.billingCycleEnd) {
    billingCycleDays = Math.max(
      differenceInDays(new Date(input.billingCycleEnd), new Date(input.billingCycleStart)),
      1,
    );
  }

  // Expected (stated) break-even days, derived from the user's target/expectation alone.
  let expectedBreakEvenDays: number | null = null;
  if (input.type === 'count' && targetUseCount != null && input.expectedUsesPerWeek) {
    expectedBreakEvenDays = targetUseCount / (input.expectedUsesPerWeek / 7);
  } else if (input.type === 'time' && input.targetDailyCost && input.targetDailyCost > 0) {
    expectedBreakEvenDays = effCost / input.targetDailyCost;
  } else if (input.type === 'quota' && input.expectedUsageRatio && input.expectedUsageRatio > 0) {
    expectedBreakEvenDays = billingCycleDays / (input.expectedUsageRatio / 100);
  }

  // Velocity-adjusted break-even days, from the user's own historical pace.
  let velocityBreakEvenDays: number | null = null;
  if (hasHistory) {
    const v = track.velocity as number;
    if (input.type === 'count' && targetUseCount != null) {
      velocityBreakEvenDays = targetUseCount / v;
    } else if (input.type === 'time') {
      velocityBreakEvenDays = effCost / v;
    } else if (input.type === 'quota') {
      velocityBreakEvenDays = billingCycleDays / v;
    }
  }

  // The headline projection follows the user's stated expectation (so the expected-
  // uses-per-week / target fields are reactive). Historical velocity is kept as a
  // reality-check: it drives the on-the-fence verdict and is shown as a secondary line.
  const projectedBreakEvenDays = expectedBreakEvenDays ?? velocityBreakEvenDays;
  const basis: SimulationResult['basis'] =
    expectedBreakEvenDays != null ? 'expected' : velocityBreakEvenDays != null ? 'history' : 'none';

  let verdict: Verdict | null = null;
  if (projectedBreakEvenDays != null) {
    if (hasHistory && expectedBreakEvenDays != null && velocityBreakEvenDays != null) {
      if (velocityBreakEvenDays <= SIM_HORIZON_DAYS) verdict = 'worth-it';
      else if (expectedBreakEvenDays <= SIM_HORIZON_DAYS) verdict = 'on-the-fence';
      else verdict = 'unlikely';
    } else {
      verdict = projectedBreakEvenDays <= SIM_HORIZON_DAYS ? 'worth-it' : 'unlikely';
    }
  }

  const projectedBreakEvenDate =
    projectedBreakEvenDays != null
      ? addDays(new Date(nowIso), Math.ceil(projectedBreakEvenDays)).toISOString()
      : null;

  // Horizon cost-per-unit projections. Count/time reuse the calculators over synthetic data
  // so the projection matches how a real asset would be scored.
  let costPerUnitAt6m: number | null = null;
  let costPerUnitAt12m: number | null = null;
  const rate = expectedRate(input) ?? (hasHistory ? (track.velocity as number) : null);
  if (rate != null && rate > 0) {
    if (input.type === 'count') {
      costPerUnitAt6m = calculateCountBasedFromUsedCount(synth, rate * HORIZON_6M_DAYS).costPerUse;
      costPerUnitAt12m = calculateCountBasedFromUsedCount(
        synth,
        rate * HORIZON_12M_DAYS,
      ).costPerUse;
    } else if (input.type === 'time') {
      costPerUnitAt6m = calculateTimeBased(
        buildSyntheticAsset(
          input,
          nowIso,
          addDays(new Date(nowIso), -HORIZON_6M_DAYS).toISOString(),
        ),
      ).dailyCost;
      costPerUnitAt12m = calculateTimeBased(
        buildSyntheticAsset(
          input,
          nowIso,
          addDays(new Date(nowIso), -HORIZON_12M_DAYS).toISOString(),
        ),
      ).dailyCost;
    } else if (input.type === 'quota') {
      // Quota horizon: usage ratio scales with cycles elapsed; value recovered caps at totalCost.
      const ratio6m = Math.min((rate * HORIZON_6M_DAYS) / billingCycleDays, 1);
      const ratio12m = Math.min((rate * HORIZON_12M_DAYS) / billingCycleDays, 1);
      costPerUnitAt6m = input.totalCost * ratio6m;
      costPerUnitAt12m = input.totalCost * ratio12m;
    }
  }

  return {
    verdict,
    basis,
    expectedBreakEvenDays,
    velocityBreakEvenDays,
    projectedBreakEvenDays,
    projectedBreakEvenDate,
    costPerUnitAt6m,
    costPerUnitAt12m,
    effectiveCost: effCost,
  };
}

/** Rate implied by the user's stated expectation, used as the projection pace when no history exists. */
function expectedRate(input: SimulationInput): number | null {
  if (input.type === 'count') {
    return input.expectedUsesPerWeek ? input.expectedUsesPerWeek / 7 : null;
  }
  if (input.type === 'time') {
    return input.targetDailyCost && input.targetDailyCost > 0 ? input.targetDailyCost : null;
  }
  if (input.type === 'quota') {
    return input.expectedUsageRatio ? input.expectedUsageRatio / 100 : null;
  }
  return null;
}

/**
 * Derive the user's historical usage velocity for a given type from their existing assets.
 * Non-archived assets only (archived ones are settled and don't reflect ongoing pace).
 */
export function deriveHistoricalVelocity(
  assets: AssetWithRecords[],
  type: AssetType,
  nowIso: string,
): TrackRecord {
  const oftype = assets.filter((a) => a.type === type && !a.archivedAt);
  const recent = [...oftype].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  let velocity: number | null = null;
  const velocityKind: TrackRecord['velocityKind'] =
    type === 'count' ? 'usesPerDay' : type === 'time' ? 'costPerDay' : 'usageRatio';

  if (type === 'count') {
    const totalUses = oftype.reduce((s, a) => s + a.usageRecords.length, 0);
    const totalDays = oftype.reduce((s, a) => s + daysSince(a.purchaseDate, nowIso), 0);
    velocity = totalDays > 0 ? totalUses / totalDays : null;
  } else if (type === 'time') {
    const totalEff = oftype.reduce((s, a) => s + (a.totalCost - (a.resaleValue ?? 0)), 0);
    const totalDays = oftype.reduce((s, a) => s + daysSince(a.purchaseDate, nowIso), 0);
    velocity = totalDays > 0 ? totalEff / totalDays : null;
  } else {
    const ratios = oftype.map((a) => calculateQuotaBased(a, a.usageRecords).usageRatio);
    velocity = ratios.length > 0 ? ratios.reduce((s, r) => s + r, 0) / ratios.length : null;
  }

  const recentAsset: TrackRecordAsset | null = recent ? buildTrackRecordAsset(recent) : null;

  return {
    type,
    hasHistory: velocity != null && velocity > 0,
    velocity,
    velocityKind,
    recentAsset,
    sampleCount: oftype.length,
  };
}

function buildTrackRecordAsset(asset: AssetWithRecords): TrackRecordAsset {
  let breakEvenProgress: number | null = null;
  let isBreakEven = false;
  let costPerUnit: number | null = null;
  if (asset.type === 'count') {
    const m = calculateCountBased(asset, asset.usageRecords);
    breakEvenProgress = m.breakEvenProgress;
    isBreakEven = m.isBreakEven;
    costPerUnit = m.costPerUse;
  } else if (asset.type === 'time') {
    const m = calculateTimeBased(asset);
    breakEvenProgress = m.breakEvenProgress;
    isBreakEven = m.isBreakEven;
    costPerUnit = m.dailyCost;
  } else {
    const m = calculateQuotaBased(asset, asset.usageRecords);
    breakEvenProgress = m.usageRatio > 1 ? 1 : m.usageRatio;
    isBreakEven = m.usageRatio >= 1;
    costPerUnit = m.usageRatio;
  }
  return {
    id: asset.id,
    name: asset.name,
    breakEvenProgress,
    isBreakEven,
    costPerUnit,
  };
}
