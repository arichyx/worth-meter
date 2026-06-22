import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AssetType, UsageRecord } from '@/lib/db/schema';
import type { Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

interface UsageRecordsListProps {
  assetId: string;
  assetType: AssetType;
  locale: Locale;
  /** Records for the current page, already sorted newest-first. */
  rows: UsageRecord[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Renders the "Usage records" card with one page of rows and prev/next
 * navigation. Page state lives in the URL (`/assets/[id]?page=N`), so the
 * controls are plain `<Link>`s; at the boundaries the control degrades to a
 * disabled `<Button>`.
 */
export function UsageRecordsList({
  assetId,
  assetType,
  locale,
  rows,
  total,
  page,
  totalPages,
  pageSize,
}: UsageRecordsListProps) {
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);
  const offset = (page - 1) * pageSize;
  const badgeVariant = assetType === 'count' ? 'count' : 'quota';
  const pageIndicator = tt('pageIndicator')
    .replace('{page}', String(page))
    .replace('{totalPages}', String(totalPages));

  // Page 1 is the default view; omit the query param to keep URLs clean.
  const pageHref = (target: number) =>
    target <= 1 ? `/assets/${assetId}` : `/assets/${assetId}?page=${target}`;

  const controlClassName = cn(buttonVariants({ variant: 'outline', size: 'sm' }));

  return (
    <Card className="overflow-hidden pt-0 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
      <CardHeader
        className={cn(
          'rounded-none border-b border-border/30 pt-4',
          assetType === 'count' && 'bg-type-count/5',
          assetType === 'quota' && 'bg-type-quota/5',
        )}
      >
        <CardTitle className="text-lg">{tt('usageRecords')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 py-4">
        {rows.map((record, i) => (
          <div
            key={record.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-surface px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Badge variant={badgeVariant} className="shrink-0">
                #{total - (offset + i)}
              </Badge>
              <span className="text-sm">
                {assetType === 'count' ? tt('oneUse') : `${tt('remaining')} ${record.value}%`}
              </span>
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">
              {format(new Date(record.recordedAt), 'yyyy-MM-dd')}
            </span>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} scroll={false} className={controlClassName}>
                <ChevronLeft className="size-3.5" />
                {tt('prevPage')}
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="size-3.5" />
                {tt('prevPage')}
              </Button>
            )}

            <span className="text-xs text-muted-foreground tabular-nums">{pageIndicator}</span>

            {page < totalPages ? (
              <Link href={pageHref(page + 1)} scroll={false} className={controlClassName}>
                {tt('nextPage')}
                <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                {tt('nextPage')}
                <ChevronRight className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
