import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { buildHeatmap, HEATMAP_WEEKS, intensityFor } from '@/lib/calculations/heatmap';
import type { UsageRecord } from '@/lib/db/schema';

const NOW = '2026-07-18T12:00:00.000Z'; // noon UTC keeps the date stable across common TZs
const todayKey = format(new Date(NOW), 'yyyy-MM-dd');

function rec(recordedAt: string, id = 'r'): UsageRecord {
  return { id, assetId: 'a', value: 1, recordedAt, createdAt: recordedAt };
}

describe('intensityFor', () => {
  it('maps counts to 4 steps', () => {
    expect(intensityFor(0)).toBe(0);
    expect(intensityFor(1)).toBe(1);
    expect(intensityFor(2)).toBe(2);
    expect(intensityFor(3)).toBe(3);
    expect(intensityFor(5)).toBe(3);
  });
});

describe('buildHeatmap', () => {
  it('includes today with its count', () => {
    const cells = buildHeatmap([rec(NOW)], HEATMAP_WEEKS, NOW);
    const today = cells.find((c) => c.date === todayKey);
    expect(today).toBeDefined();
    expect(today?.count).toBe(1);
  });

  it('aggregates multiple records on the same date into one cell', () => {
    const cells = buildHeatmap([rec(NOW, 'a'), rec(NOW, 'b')], HEATMAP_WEEKS, NOW);
    const today = cells.find((c) => c.date === todayKey);
    expect(today?.count).toBe(2);
  });

  it('excludes dates older than the trailing window', () => {
    // 400 days ago is well outside 26 weeks (182 days)
    const old = new Date(new Date(NOW).getTime() - 400 * 86400000).toISOString();
    const cells = buildHeatmap([rec(old)], HEATMAP_WEEKS, NOW);
    const oldKey = format(new Date(old), 'yyyy-MM-dd');
    expect(cells.find((c) => c.date === oldKey)).toBeUndefined();
  });

  it('includes a recent in-range date', () => {
    const recent = new Date(new Date(NOW).getTime() - 30 * 86400000).toISOString();
    const cells = buildHeatmap([rec(recent)], HEATMAP_WEEKS, NOW);
    const recentKey = format(new Date(recent), 'yyyy-MM-dd');
    const cell = cells.find((c) => c.date === recentKey);
    expect(cell).toBeDefined();
    expect(cell?.count).toBe(1);
  });

  it('aligns the first cell to a Sunday', () => {
    const cells = buildHeatmap([], HEATMAP_WEEKS, NOW);
    expect(cells[0].dayOfWeek).toBe(0);
  });

  it('renders zero counts for an empty record set', () => {
    const cells = buildHeatmap([], HEATMAP_WEEKS, NOW);
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.every((c) => c.count === 0)).toBe(true);
    // today still present
    expect(cells.find((c) => c.date === todayKey)).toBeDefined();
  });

  it('produces roughly `weeks` columns of 7 days', () => {
    const cells = buildHeatmap([], HEATMAP_WEEKS, NOW);
    // between weeks and weeks+1 columns worth of days
    const days = cells.length;
    expect(days).toBeGreaterThanOrEqual(HEATMAP_WEEKS * 7);
    expect(days).toBeLessThan((HEATMAP_WEEKS + 1) * 7 + 7);
  });
});
