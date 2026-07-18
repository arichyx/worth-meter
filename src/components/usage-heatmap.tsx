import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildHeatmap, HEATMAP_WEEKS, type HeatmapCell, intensityFor } from '@/lib/calculations';
import type { UsageRecord } from '@/lib/db/schema';
import type { Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const INTENSITY_CLASS: Record<number, string> = {
  0: 'bg-muted/40',
  1: 'bg-type-count/30',
  2: 'bg-type-count/60',
  3: 'bg-type-count',
};

interface UsageHeatmapProps {
  records: UsageRecord[];
  locale: Locale;
}

/**
 * Calendar heatmap (GitHub-contributions style) of count usage over the trailing
 * ~26 weeks. Server-rendered; hover via native `title` tooltips.
 */
export function UsageHeatmap({ records, locale }: UsageHeatmapProps) {
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);
  const nowIso = new Date().toISOString();
  const cells = buildHeatmap(records, HEATMAP_WEEKS, nowIso);

  // Chunk the flat Sun-aligned cell list into week columns of up to 7 days.
  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  let lastMonth = '';

  return (
    <Card className="overflow-hidden pt-0 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
      <CardHeader className="rounded-none border-b border-border/30 bg-type-count/5 pt-4">
        <CardTitle className="text-lg">{tt('usageHeatmap')}</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex flex-col gap-2">
            {/* Month labels */}
            <div className="flex gap-1 pl-0">
              {weeks.map((week, wi) => {
                const first = week[0];
                if (!first) return <div key={wi} className="w-3" />;
                const month = format(new Date(first.date), 'MMM');
                const show = month !== lastMonth;
                lastMonth = month;
                return (
                  <div key={wi} className="w-3 text-[9px] leading-none text-muted-foreground">
                    {show ? month : ''}
                  </div>
                );
              })}
            </div>
            {/* Grid */}
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, row) => {
                    const cell = week[row];
                    if (!cell) return <div key={row} className="size-3" />;
                    const intensity = intensityFor(cell.count);
                    const tooltip =
                      cell.count > 0
                        ? tt('heatmapUses')
                            .replace('{count}', String(cell.count))
                            .replace('{date}', cell.date)
                        : tt('heatmapNoUses').replace('{date}', cell.date);
                    return (
                      <div
                        key={row}
                        title={tooltip}
                        className={cn('size-3 rounded-sm', INTENSITY_CLASS[intensity])}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground">{tt('heatmapLegendLess')}</span>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={cn('size-3 rounded-sm', INTENSITY_CLASS[i])} />
              ))}
              <span className="text-[10px] text-muted-foreground">{tt('heatmapLegendMore')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
