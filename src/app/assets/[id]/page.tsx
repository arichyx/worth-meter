import { format } from 'date-fns';
import { Archive, Clock, Hash, Layers } from 'lucide-react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  type CountBasedMetrics,
  calculateCountBased,
  calculateQuotaBased,
  calculateTimeBased,
  type QuotaBasedMetrics,
  type TimeBasedMetrics,
} from '@/lib/calculations';
import {
  CURRENCY_COOKIE_NAME,
  type Currency,
  getCurrencySymbol,
  isValidCurrency,
} from '@/lib/currency';
import { getAssetWithRecords } from '@/lib/db/queries';
import type { AssetType } from '@/lib/db/schema';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';
import { AssetChart } from './asset-chart';
import { DetailHeader } from './detail-header';
import { UsageDialog } from './usage-dialog';

const TYPE_STYLES: Record<
  AssetType,
  {
    accent: string;
    badgeVariant: 'time' | 'count' | 'quota';
    progressTone: 'time' | 'count' | 'quota';
    iconShell: string;
  }
> = {
  time: {
    accent: 'text-type-time',
    badgeVariant: 'time',
    progressTone: 'time',
    iconShell: 'border-type-time/20 bg-type-time/8 text-type-time',
  },
  count: {
    accent: 'text-type-count',
    badgeVariant: 'count',
    progressTone: 'count',
    iconShell: 'border-type-count/20 bg-type-count/8 text-type-count',
  },
  quota: {
    accent: 'text-type-quota',
    badgeVariant: 'quota',
    progressTone: 'quota',
    iconShell: 'border-type-quota/20 bg-type-quota/8 text-type-quota',
  },
};

function getTypeIcon(type: AssetType) {
  switch (type) {
    case 'time':
      return <Clock className="size-5" />;
    case 'count':
      return <Hash className="size-5" />;
    case 'quota':
      return <Layers className="size-5" />;
  }
}

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const locale: Locale = isValidLocale(raw) ? raw : 'zh';
  const rawCurrency = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  const currency: Currency = isValidCurrency(rawCurrency) ? rawCurrency : 'cny';
  const sym = getCurrencySymbol(currency);
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);

  const asset = getAssetWithRecords(id);
  if (!asset) notFound();

  let metrics: CountBasedMetrics | QuotaBasedMetrics | TimeBasedMetrics;
  switch (asset.type) {
    case 'time':
      metrics = calculateTimeBased(asset);
      break;
    case 'count':
      metrics = calculateCountBased(asset, asset.usageRecords);
      break;
    case 'quota':
      metrics = calculateQuotaBased(asset, asset.usageRecords);
      break;
  }

  const typeStyles = TYPE_STYLES[asset.type];
  const typeLabel = tt(
    asset.type === 'time' ? 'timeBased' : asset.type === 'count' ? 'countBased' : 'quotaBased',
  );
  const spotlight =
    asset.type === 'time'
      ? {
          label: tt('dailyCost'),
          value: `${sym}${(metrics as TimeBasedMetrics).dailyCost.toFixed(1)}`,
          progress: (metrics as TimeBasedMetrics).breakEvenProgress,
        }
      : asset.type === 'count'
        ? {
            label: tt('costPerUse'),
            value: `${sym}${(metrics as CountBasedMetrics).costPerUse.toFixed(1)}`,
            progress: (metrics as CountBasedMetrics).breakEvenProgress,
          }
        : {
            label: tt('usageRate'),
            value: `${((metrics as QuotaBasedMetrics).usageRatio * 100).toFixed(0)}%`,
            progress: Math.min((metrics as QuotaBasedMetrics).usageRatio, 1),
          };

  return (
    <div className="min-h-screen bg-background">
      <DetailHeader asset={asset} />

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-xl border border-border/40 shadow-sm mb-10">
          <div
            className={cn(
              'absolute inset-0',
              asset.type === 'time' && 'bg-type-time/4',
              asset.type === 'count' && 'bg-type-count/4',
              asset.type === 'quota' && 'bg-type-quota/4',
            )}
          />
          <div className="relative flex flex-col gap-6 px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant={typeStyles.badgeVariant} className="h-7 px-3">
                  {getTypeIcon(asset.type)}
                  {typeLabel}
                </Badge>
                {asset.archivedAt && (
                  <Badge variant="outline" className="h-7 px-3 text-muted-foreground">
                    <Archive className="size-3.5" />
                    {tt('archived')}
                  </Badge>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-xl border bg-card',
                    typeStyles.iconShell,
                  )}
                >
                  {getTypeIcon(asset.type)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {asset.name}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {sym}
                    {asset.totalCost.toLocaleString()} · {tt('purchasedOn')}{' '}
                    {format(new Date(asset.purchaseDate), 'yyyy-MM-dd')}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:max-w-sm">
              <div className="rounded-xl border border-border/40 bg-surface p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">{spotlight.label}</p>
                <p
                  className={cn(
                    'mt-2 text-3xl font-semibold tracking-tight tabular-nums',
                    typeStyles.accent,
                  )}
                >
                  {spotlight.value}
                </p>
                {spotlight.progress !== null && (
                  <div className="mt-4 flex items-center gap-3">
                    <Progress
                      value={Math.min(spotlight.progress * 100, 100)}
                      tone={typeStyles.progressTone}
                      className="min-w-0 flex-1"
                    />
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {Math.min(spotlight.progress * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {asset.type !== 'time' && (
                  <div className="mt-5">
                    <UsageDialog assetId={id} assetType={asset.type} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {asset.type === 'time' &&
            (() => {
              const m = metrics as TimeBasedMetrics;
              return (
                <>
                  <MetricCard
                    title={tt('dailyCost')}
                    value={`${sym}${m.dailyCost.toFixed(1)}`}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('daysUsed')}
                    value={`${m.daysSincePurchase}`}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('targetDays')}
                    value={m.targetDays?.toString() ?? 'N/A'}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('breakEvenProgress')}
                    value={
                      m.breakEvenProgress !== null
                        ? `${(m.breakEvenProgress * 100).toFixed(0)}%`
                        : 'N/A'
                    }
                    progress={m.breakEvenProgress}
                    tone={typeStyles.progressTone}
                  />
                </>
              );
            })()}
          {asset.type === 'count' &&
            (() => {
              const m = metrics as CountBasedMetrics;
              return (
                <>
                  <MetricCard
                    title={tt('costPerUse')}
                    value={`${sym}${m.costPerUse.toFixed(1)}`}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('uses')}
                    value={`${m.usedCount}`}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('targetUses')}
                    value={m.targetUseCount?.toString() ?? 'N/A'}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('breakEvenProgress')}
                    value={
                      m.breakEvenProgress !== null
                        ? `${(m.breakEvenProgress * 100).toFixed(0)}%`
                        : 'N/A'
                    }
                    progress={m.breakEvenProgress}
                    tone={typeStyles.progressTone}
                  />
                </>
              );
            })()}
          {asset.type === 'quota' &&
            (() => {
              const m = metrics as QuotaBasedMetrics;
              return (
                <>
                  <MetricCard
                    title={tt('usageRate')}
                    value={`${(m.usageRatio * 100).toFixed(0)}%`}
                    progress={m.usageRatio > 1 ? 1 : m.usageRatio}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('valueRecovered')}
                    value={`${sym}${m.estimatedValue.toFixed(0)}`}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('expectedWeeks')}
                    value={m.expectedWeeklyQuota.toFixed(1)}
                    tone={typeStyles.progressTone}
                  />
                  <MetricCard
                    title={tt('records')}
                    value={`${m.recordCount}`}
                    tone={typeStyles.progressTone}
                  />
                </>
              );
            })()}
        </div>

        <Separator className="mb-10" />

        {asset.usageRecords.length > 0 && <AssetChart asset={asset} />}

        {asset.type !== 'time' && asset.usageRecords.length > 0 && (
          <Card className="overflow-hidden pt-0 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
            <CardHeader
              className={cn(
                'rounded-none border-b border-border/30 pt-4',
                asset.type === 'count' && 'bg-type-count/5',
                asset.type === 'quota' && 'bg-type-quota/5',
              )}
            >
              <CardTitle className="text-lg">{tt('usageRecords')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 py-4">
              {[...asset.usageRecords]
                .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                .map((record, i) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-surface px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Badge variant={typeStyles.badgeVariant} className="shrink-0">
                        #{asset.usageRecords.length - i}
                      </Badge>
                      <span className="text-sm">
                        {asset.type === 'count'
                          ? tt('oneUse')
                          : `${tt('remaining')} ${record.value}%`}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {format(new Date(record.recordedAt), 'yyyy-MM-dd')}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  progress,
  tone,
}: {
  title: string;
  value: string;
  progress?: number | null;
  tone: 'time' | 'count' | 'quota';
}) {
  const toneDot =
    tone === 'time' ? 'bg-type-time' : tone === 'count' ? 'bg-type-count' : 'bg-type-quota';

  return (
    <Card className="border-border/40 bg-surface shadow-sm">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <span className={cn('size-2 shrink-0 rounded-full', toneDot)} />
        </div>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {progress !== null && progress !== undefined && (
          <div className="flex items-center gap-3">
            <Progress
              value={Math.min(progress * 100, 100)}
              tone={tone}
              className="min-w-0 flex-1"
            />
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {Math.min(progress * 100, 100).toFixed(0)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
