import type { Asset, AssetType, UsageRecord } from '../db/schema';
import { calculateCountBased } from './count-based';
import { calculateQuotaBased } from './quota-based';
import { calculateTimeBased } from './time-based';

interface AssetWithRecords extends Asset {
  usageRecords: UsageRecord[];
}

export type RankingStatus = 'ranked' | 'waitingForUsage';
export type AttentionReason =
  | 'highestHoldingCost'
  | 'highestCostPerUse'
  | 'lowestUtilization'
  | 'waitingForUsage';

export interface RankedAsset {
  asset: AssetWithRecords;
  type: AssetType;
  /** dailyCost (time) · costPerUse (count) · usageRatio (quota). */
  primaryMetric: number;
  /** 1-based rank within the asset type; null when no observed metric exists yet. */
  rank: number | null;
  status: RankingStatus;
  /** Recorded uses (count), days held (time), or quota snapshots (quota). */
  observationCount: number;
  /** Optional count/time break-even progress for secondary display only. */
  targetProgress: number | null;
  isBreakEven: boolean;
}

export interface TypeValueInsight {
  type: AssetType;
  best: RankedAsset | null;
  attention: RankedAsset | null;
  attentionReason: AttentionReason | null;
}

const ASSET_TYPES: AssetType[] = ['time', 'count', 'quota'];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeObservedMetric(asset: AssetWithRecords): Omit<RankedAsset, 'rank'> {
  if (asset.type === 'count') {
    const metrics = calculateCountBased(asset, asset.usageRecords);
    return {
      asset,
      type: asset.type,
      primaryMetric: metrics.costPerUse,
      status: metrics.usedCount > 0 ? 'ranked' : 'waitingForUsage',
      observationCount: metrics.usedCount,
      targetProgress: metrics.breakEvenProgress == null ? null : clamp01(metrics.breakEvenProgress),
      isBreakEven: metrics.isBreakEven,
    };
  }

  if (asset.type === 'time') {
    const metrics = calculateTimeBased(asset);
    return {
      asset,
      type: asset.type,
      primaryMetric: metrics.dailyCost,
      status: 'ranked',
      observationCount: metrics.daysSincePurchase,
      targetProgress: metrics.breakEvenProgress == null ? null : clamp01(metrics.breakEvenProgress),
      isBreakEven: metrics.isBreakEven,
    };
  }

  const metrics = calculateQuotaBased(asset, asset.usageRecords);
  return {
    asset,
    type: asset.type,
    primaryMetric: metrics.usageRatio,
    status: 'ranked',
    observationCount: metrics.recordCount,
    targetProgress: null,
    isBreakEven: false,
  };
}

function compareObservedValue(a: Omit<RankedAsset, 'rank'>, b: Omit<RankedAsset, 'rank'>) {
  if (a.status !== b.status) return a.status === 'ranked' ? -1 : 1;

  if (a.status === 'ranked') {
    const byMetric =
      a.type === 'quota' ? b.primaryMetric - a.primaryMetric : a.primaryMetric - b.primaryMetric;
    if (byMetric !== 0) return byMetric;
  }

  const byCost = a.asset.totalCost - b.asset.totalCost;
  if (byCost !== 0) return byCost;
  return a.asset.id.localeCompare(b.asset.id);
}

/**
 * Rank active assets of one type by their native, target-independent observed metric.
 * Unlike units are intentionally never combined into a cross-type score.
 */
export function rankAssetsByObservedValue(
  assets: AssetWithRecords[],
  type: AssetType,
): RankedAsset[] {
  const computed = assets
    .filter((asset) => !asset.archivedAt && asset.type === type)
    .map(computeObservedMetric)
    .sort(compareObservedValue);

  let rank = 0;
  return computed.map((item) => {
    if (item.status === 'ranked') rank += 1;
    return {
      ...item,
      rank: item.status === 'ranked' ? rank : null,
    };
  });
}

function attentionReasonFor(ranked: RankedAsset): AttentionReason {
  if (ranked.status === 'waitingForUsage') return 'waitingForUsage';
  if (ranked.type === 'time') return 'highestHoldingCost';
  if (ranked.type === 'count') return 'highestCostPerUse';
  return 'lowestUtilization';
}

/**
 * Build an overview without pretending that cost/day, cost/use, and utilization
 * share one comparable score.
 */
export function buildValueInsights(assets: AssetWithRecords[]): TypeValueInsight[] {
  return ASSET_TYPES.map((type) => {
    const ranked = rankAssetsByObservedValue(assets, type);
    const best = ranked.find((item) => item.rank === 1) ?? null;

    let attention: RankedAsset | null = null;
    if (ranked.length > 1) {
      const waiting = ranked.find((item) => item.status === 'waitingForUsage');
      attention =
        waiting && waiting.asset.id !== best?.asset.id
          ? waiting
          : ([...ranked]
              .reverse()
              .find((item) => item.rank != null && item.asset.id !== best?.asset.id) ?? null);
    }

    return {
      type,
      best,
      attention,
      attentionReason: attention ? attentionReasonFor(attention) : null,
    };
  });
}
