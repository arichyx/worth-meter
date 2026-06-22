import { describe, expect, it } from 'vitest';
import type { UsageRecord } from '@/lib/db/schema';
import { paginateRecords, parsePageParam, USAGE_RECORDS_PAGE_SIZE } from '@/lib/pagination';

function makeRecords(count: number): UsageRecord[] {
  // recordedAt increases with index so newest-first ordering is meaningful.
  return Array.from({ length: count }, (_, i) => ({
    id: `rec-${i}`,
    assetId: 'asset-1',
    value: 1,
    recordedAt: new Date(2025, 0, i + 1).toISOString(),
    createdAt: new Date(2025, 0, i + 1).toISOString(),
  }));
}

describe('parsePageParam', () => {
  it('returns 1 when undefined', () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it('parses a numeric string', () => {
    expect(parsePageParam('3')).toBe(3);
  });

  it('takes the first value when given an array', () => {
    expect(parsePageParam(['2', '5'])).toBe(2);
  });

  it('falls back to 1 for non-numeric strings', () => {
    expect(parsePageParam('abc')).toBe(1);
  });

  it('falls back to 1 for zero', () => {
    expect(parsePageParam('0')).toBe(1);
  });

  it('falls back to 1 for negatives', () => {
    expect(parsePageParam('-2')).toBe(1);
  });

  it('falls back to 1 when the first array value is non-numeric', () => {
    expect(parsePageParam(['abc', '3'])).toBe(1);
  });
});

describe('paginateRecords', () => {
  it('returns total 0 and page 1 for empty input', () => {
    const result = paginateRecords([], 1);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.rows).toEqual([]);
  });

  it('returns a single record as-is on page 1', () => {
    const records = makeRecords(1);
    const result = paginateRecords(records, 1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBe('rec-0');
  });

  it('returns the most recent pageSize records on the first page', () => {
    const records = makeRecords(USAGE_RECORDS_PAGE_SIZE + 5);
    const result = paginateRecords(records, 1);
    expect(result.rows).toHaveLength(USAGE_RECORDS_PAGE_SIZE);
    // newest-first: last record (rec-{n-1}) comes first
    expect(result.rows[0].id).toBe(`rec-${records.length - 1}`);
  });

  it('orders rows newest-first within the page', () => {
    const records = makeRecords(3);
    const result = paginateRecords(records, 1);
    expect(result.rows.map((r) => r.id)).toEqual(['rec-2', 'rec-1', 'rec-0']);
  });

  it('returns the next window on the second page', () => {
    const records = makeRecords(USAGE_RECORDS_PAGE_SIZE + 3); // 2 pages
    const page1 = paginateRecords(records, 1);
    const page2 = paginateRecords(records, 2);
    expect(page1.rows).toHaveLength(USAGE_RECORDS_PAGE_SIZE);
    expect(page2.rows).toHaveLength(3);
    // no overlap between pages
    const page1Ids = new Set(page1.rows.map((r) => r.id));
    for (const row of page2.rows) expect(page1Ids.has(row.id)).toBe(false);
  });

  it('computes totalPages at the boundary', () => {
    expect(paginateRecords(makeRecords(USAGE_RECORDS_PAGE_SIZE), 1).totalPages).toBe(1);
    expect(paginateRecords(makeRecords(USAGE_RECORDS_PAGE_SIZE + 1), 1).totalPages).toBe(2);
  });

  it('clamps a page above totalPages down to the last page', () => {
    const records = makeRecords(USAGE_RECORDS_PAGE_SIZE + 5); // 2 pages
    const result = paginateRecords(records, 99);
    expect(result.page).toBe(2);
    expect(result.rows).toHaveLength(records.length - USAGE_RECORDS_PAGE_SIZE);
  });

  it('clamps NaN page to 1', () => {
    const result = paginateRecords(makeRecords(25), Number.NaN);
    expect(result.page).toBe(1);
  });

  it('clamps zero and negative pages to 1', () => {
    expect(paginateRecords(makeRecords(25), 0).page).toBe(1);
    expect(paginateRecords(makeRecords(25), -3).page).toBe(1);
  });

  it('honors a custom page size', () => {
    const records = makeRecords(10);
    const result = paginateRecords(records, 2, 3);
    expect(result.totalPages).toBe(4);
    expect(result.rows).toHaveLength(3);
  });
});
