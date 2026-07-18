import { addDays, differenceInCalendarDays, format, getDay, startOfDay, subDays } from 'date-fns';
import type { UsageRecord } from '../db/schema';

/** Number of trailing weeks the heatmap covers. */
export const HEATMAP_WEEKS = 26;

export type HeatmapIntensity = 0 | 1 | 2 | 3;

export interface HeatmapCell {
  /** Calendar date key, `yyyy-MM-dd` (local), matching `UsageRecordsList` display. */
  date: string;
  /** Number of usage records on this date. */
  count: number;
  /** Day of week, 0 (Sun) .. 6 (Sat). */
  dayOfWeek: number;
}

/** Map a per-day usage count to a 4-step intensity (0 empty, 1 light, 2 medium, 3+ full). */
export function intensityFor(count: number): HeatmapIntensity {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

/**
 * Build the heatmap day cells for the trailing `weeks` ending at `nowIso`,
 * aligned so each column is a full week (Sun..Sat). Records are bucketed by the
 * local calendar date of their `recordedAt`. `nowIso` is injected (not computed
 * inside) so the helper is pure and deterministic in tests.
 */
export function buildHeatmap(records: UsageRecord[], weeks: number, nowIso: string): HeatmapCell[] {
  const now = new Date(nowIso);
  const today = startOfDay(now);

  const counts = new Map<string, number>();
  for (const r of records) {
    const key = format(new Date(r.recordedAt), 'yyyy-MM-dd');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Earliest day in the trailing window, then align back to its week's Sunday.
  const earliest = subDays(today, weeks * 7 - 1);
  const start = subDays(earliest, getDay(earliest));

  const cells: HeatmapCell[] = [];
  let cursor = start;
  while (differenceInCalendarDays(today, cursor) >= 0) {
    const key = format(cursor, 'yyyy-MM-dd');
    cells.push({
      date: key,
      count: counts.get(key) ?? 0,
      dayOfWeek: getDay(cursor),
    });
    cursor = addDays(cursor, 1);
  }
  return cells;
}
