import type { UsageRecord } from './db/schema';

/**
 * Page size for the count-based asset usage-records list.
 */
export const USAGE_RECORDS_PAGE_SIZE = 10;

export interface PaginatedRecords {
  rows: UsageRecord[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Normalize a raw `searchParams.page` value into a positive integer.
 *
 * `searchParams` values can be `string | string[] | undefined` (see
 * `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`).
 * Anything missing, non-numeric, or non-positive resolves to page 1.
 *
 * This does NOT know the total page count — clamping to the last page is done
 * by `paginateRecords`, which needs the record total.
 */
export function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

/**
 * Paginate usage records newest-first, clamping `page` to the valid range.
 *
 * Sorting is part of the contract so callers always receive display-order rows.
 */
export function paginateRecords(
  records: UsageRecord[],
  page: number,
  pageSize: number = USAGE_RECORDS_PAGE_SIZE,
): PaginatedRecords {
  const total = records.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Number.isNaN(page) || page < 1 ? 1 : Math.min(page, totalPages);

  const sorted = [...records].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  const start = (safePage - 1) * pageSize;
  const rows = sorted.slice(start, start + pageSize);

  return { rows, total, page: safePage, totalPages };
}
