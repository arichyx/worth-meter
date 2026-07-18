import { differenceInDays } from 'date-fns';
import type { Asset, UsageRecord } from '../db/schema';
import { calculateCountBased } from './count-based';

/** A count asset is "stale" and worth nudging once this many days pass without a logged use. */
export const NUDGE_STALE_DAYS = 7;

interface AssetWithRecords extends Asset {
  usageRecords: UsageRecord[];
}

export interface Nudge {
  assetId: string;
  name: string;
  daysSinceLastUse: number;
}

/**
 * Find active count assets whose logging has gone stale (no use logged within
 * `NUDGE_STALE_DAYS`) and that have not yet broken even. Non-count and archived
 * assets are ignored. `nowIso` is injected for determinism and tests.
 */
export function deriveNudges(assets: AssetWithRecords[], nowIso: string): Nudge[] {
  const now = new Date(nowIso);
  const nudges: Nudge[] = [];

  for (const asset of assets) {
    if (asset.type !== 'count' || asset.archivedAt) continue;

    let latest: Date | null = null;
    for (const r of asset.usageRecords) {
      const d = new Date(r.recordedAt);
      if (!latest || d > latest) latest = d;
    }
    const reference = latest ?? new Date(asset.purchaseDate);
    const daysSinceLastUse = differenceInDays(now, reference);
    if (daysSinceLastUse < NUDGE_STALE_DAYS) continue;

    const m = calculateCountBased(asset, asset.usageRecords);
    if (m.isBreakEven) continue;

    nudges.push({ assetId: asset.id, name: asset.name, daysSinceLastUse });
  }

  return nudges;
}
