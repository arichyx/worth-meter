import type { AssetType } from '@/lib/db/schema';

type UsageRecordAsset = {
  type: AssetType;
  archivedAt: string | null;
};

export function canAddUsageRecord(asset: UsageRecordAsset): boolean {
  return asset.type !== 'count' || asset.archivedAt === null;
}

export function assertCanAddUsageRecord(
  asset: UsageRecordAsset | null | undefined,
): asserts asset is UsageRecordAsset {
  if (!asset) {
    throw new Error('Asset not found');
  }

  if (!canAddUsageRecord(asset)) {
    throw new Error('Cannot add a usage record to an archived count-based asset');
  }
}
