import { differenceInDays } from 'date-fns';
import type { Asset, UsageRecord } from '../db/schema';

export interface QuotaBasedMetrics {
  totalUsedWeeklyQuota: number;
  expectedWeeklyQuota: number;
  usageRatio: number;
  estimatedValue: number;
  billingCycleDays: number;
  recordCount: number;
}

export function calculateQuotaBased(asset: Asset, records: UsageRecord[]): QuotaBasedMetrics {
  const billingCycleDays =
    asset.billingCycleStart && asset.billingCycleEnd
      ? Math.max(
          differenceInDays(new Date(asset.billingCycleEnd), new Date(asset.billingCycleStart)),
          1,
        )
      : 30;

  const expectedWeeklyQuota = billingCycleDays / 7;

  const totalUsedWeeklyQuota = records.reduce((sum, record) => {
    const usedRatio = (100 - record.value) / 100;
    return sum + usedRatio;
  }, 0);

  const usageRatio = expectedWeeklyQuota > 0 ? totalUsedWeeklyQuota / expectedWeeklyQuota : 0;

  const estimatedValue = asset.totalCost * Math.min(usageRatio, 1);

  return {
    totalUsedWeeklyQuota: Math.round(totalUsedWeeklyQuota * 100) / 100,
    expectedWeeklyQuota: Math.round(expectedWeeklyQuota * 100) / 100,
    usageRatio: Math.round(usageRatio * 1000) / 1000,
    estimatedValue: Math.round(estimatedValue * 100) / 100,
    billingCycleDays,
    recordCount: records.length,
  };
}
