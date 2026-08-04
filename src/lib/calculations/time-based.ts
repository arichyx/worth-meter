import { differenceInDays } from 'date-fns';
import type { Asset } from '../db/schema';

export interface TimeBasedMetrics {
  daysSincePurchase: number;
  dailyCost: number;
  targetDays: number | null;
  breakEvenProgress: number | null;
  isBreakEven: boolean;
  effectiveCost: number;
}

export function calculateTimeBased(asset: Asset, asOf: Date = new Date()): TimeBasedMetrics {
  const endDate = asset.archivedAt ? new Date(asset.archivedAt) : asOf;
  const daysSincePurchase = Math.max(differenceInDays(endDate, new Date(asset.purchaseDate)), 1);

  const effectiveCost = asset.totalCost - (asset.resaleValue ?? 0);
  const dailyCost = effectiveCost / daysSincePurchase;

  let targetDays: number | null = null;
  let breakEvenProgress: number | null = null;

  if (asset.targetDailyCost && asset.targetDailyCost > 0) {
    targetDays = Math.ceil(effectiveCost / asset.targetDailyCost);
    breakEvenProgress = Math.min(daysSincePurchase / targetDays, 1);
  }

  return {
    daysSincePurchase,
    dailyCost,
    targetDays,
    breakEvenProgress,
    isBreakEven: breakEvenProgress !== null && breakEvenProgress >= 1,
    effectiveCost,
  };
}
