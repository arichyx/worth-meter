import type { Asset, UsageRecord } from '../db/schema';

export interface CountBasedMetrics {
  usedCount: number;
  costPerUse: number;
  targetUseCount: number | null;
  breakEvenProgress: number | null;
  isBreakEven: boolean;
}

export function calculateCountBased(asset: Asset, records: UsageRecord[]): CountBasedMetrics {
  const usedCount = records.length;
  const costPerUse = usedCount > 0 ? asset.totalCost / usedCount : asset.totalCost;

  let targetUseCount: number | null = null;
  let breakEvenProgress: number | null = null;

  if (asset.targetUnitCost && asset.targetUnitCost > 0) {
    targetUseCount = Math.ceil(asset.totalCost / asset.targetUnitCost);
    breakEvenProgress = Math.min(usedCount / targetUseCount, 1);
  }

  return {
    usedCount,
    costPerUse,
    targetUseCount,
    breakEvenProgress,
    isBreakEven: breakEvenProgress !== null && breakEvenProgress >= 1,
  };
}
