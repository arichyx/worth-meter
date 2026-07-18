import { AlertCircle, Archive, Clock, Hash, Layers } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { EmptyState } from '@/components/empty-state';
import { OverviewCard } from '@/components/overview-card';
import { QuickLogButton } from '@/components/quick-log-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  type CountBasedMetrics,
  calculateCountBased,
  calculateQuotaBased,
  calculateTimeBased,
  deriveNudges,
  type QuotaBasedMetrics,
  type TimeBasedMetrics,
} from '@/lib/calculations';
import {
  CURRENCY_COOKIE_NAME,
  type Currency,
  getCurrencySymbol,
  isValidCurrency,
} from '@/lib/currency';
import { getAllAssetsWithRecords } from '@/lib/db/queries';
import type { Asset, AssetType, UsageRecord } from '@/lib/db/schema';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

interface AssetWithRecords extends Asset {
  usageRecords: UsageRecord[];
}

interface Summary {
  primary: string;
  secondary: string;
  progress: number | null;
  label?: string;
}

interface AssetWithSummary {
  asset: AssetWithRecords;
  summary: Summary;
}

const TYPE_STYLES: Record<AssetType, { accent: string; iconShell: string; tint: string }> = {
  time: {
    accent: 'text-type-time',
    iconShell: 'border border-type-time/20 bg-type-time/10 text-type-time',
    tint: 'bg-type-time/5',
  },
  count: {
    accent: 'text-type-count',
    iconShell: 'border border-type-count/20 bg-type-count/10 text-type-count',
    tint: 'bg-type-count/5',
  },
  quota: {
    accent: 'text-type-quota',
    iconShell: 'border border-type-quota/20 bg-type-quota/10 text-type-quota',
    tint: 'bg-type-quota/5',
  },
};

function getTypeIcon(type: AssetType) {
  switch (type) {
    case 'time':
      return <Clock className="h-4 w-4" />;
    case 'count':
      return <Hash className="h-4 w-4" />;
    case 'quota':
      return <Layers className="h-4 w-4" />;
  }
}

function computeSummary(locale: Locale, asset: AssetWithRecords, sym: string): Summary {
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);
  switch (asset.type) {
    case 'time': {
      const m: TimeBasedMetrics = calculateTimeBased(asset);
      return {
        primary: `${sym}${m.dailyCost.toFixed(2)} / ${locale === 'zh' ? '天' : 'day'}`,
        secondary: `${tt('daysUsed')} ${m.daysSincePurchase} ${locale === 'zh' ? '天' : 'days'}`,
        progress: m.breakEvenProgress,
        label: m.isBreakEven ? tt('breakEvenReached') : undefined,
      };
    }
    case 'count': {
      const m: CountBasedMetrics = calculateCountBased(asset, asset.usageRecords);
      return {
        primary: `${sym}${m.costPerUse.toFixed(2)} / ${locale === 'zh' ? '次' : 'use'}`,
        secondary: `${tt('used')} ${m.usedCount} ${tt('times')}`,
        progress: m.breakEvenProgress,
        label: m.isBreakEven ? tt('breakEvenReached') : undefined,
      };
    }
    case 'quota': {
      const m: QuotaBasedMetrics = calculateQuotaBased(asset, asset.usageRecords);
      return {
        primary: `${tt('usageRate')} ${(m.usageRatio * 100).toFixed(0)}%`,
        secondary: `${tt('valueRecovered')} ${sym}${m.estimatedValue.toFixed(0)}`,
        progress: m.usageRatio > 1 ? 1 : m.usageRatio,
        label: m.usageRatio >= 1 ? tt('breakEvenReached') : undefined,
      };
    }
  }
}

function AssetCard({
  asset,
  summary,
  archived,
  sym,
}: AssetWithSummary & { archived?: boolean; sym: string }) {
  const styles = TYPE_STYLES[asset.type];
  const canQuickLog = asset.type === 'count' && !archived;
  return (
    <Card
      size="sm"
      className={cn(
        'relative cursor-pointer gap-2 py-3 transition-shadow hover:shadow-md',
        archived && 'opacity-60',
      )}
    >
      <CardHeader className="gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="truncate">{asset.name}</CardTitle>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {sym}
            {asset.totalCost.toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn('text-xl font-semibold tabular-nums', styles.accent)}>
            {summary.primary}
          </span>
          {summary.label && (
            <Badge variant="success" className="shrink-0">
              {summary.label}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{summary.secondary}</p>
        {summary.progress !== null && (
          <Progress value={Math.min(summary.progress * 100, 100)} className="mt-1 h-1" />
        )}
        {canQuickLog && (
          <div className="relative z-10 flex justify-end pt-1">
            <QuickLogButton assetId={asset.id} />
          </div>
        )}
      </CardContent>
      {/* Navigation overlay shares the card's stacking context and stays beneath the quick-log button. */}
      <Link href={`/assets/${asset.id}`} className="absolute inset-0 z-0" aria-label={asset.name} />
    </Card>
  );
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const locale: Locale = isValidLocale(raw) ? raw : 'zh';
  const rawCurrency = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  const currency: Currency = isValidCurrency(rawCurrency) ? rawCurrency : 'cny';
  const sym = getCurrencySymbol(currency);
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);

  const assets = getAllAssetsWithRecords();

  const enriched: AssetWithSummary[] = assets.map((asset) => ({
    asset,
    summary: computeSummary(locale, asset, sym),
  }));

  const nowIso = new Date().toISOString();
  const nudges = deriveNudges(assets, nowIso);

  let totalInvestment = 0;
  let breakEvenCount = 0;
  let progressSum = 0;
  for (const { asset, summary } of enriched) {
    totalInvestment += asset.totalCost;
    if (summary.label) breakEvenCount += 1;
    progressSum += summary.progress ?? 0;
  }
  const avgProgress = enriched.length > 0 ? progressSum / enriched.length : 0;

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <OverviewCard
              title={tt('totalInvested')}
              value={`${sym}${totalInvestment.toLocaleString()}`}
              helper={`${assets.length} ${tt('assets')} · ${breakEvenCount} ${tt('breakEven')}`}
            />
            <OverviewCard
              title={tt('breakEven')}
              value={String(breakEvenCount)}
              helper={tt('assetsReachedBreakEven')}
            />
            <OverviewCard
              title={tt('avgBreakEvenProgress')}
              value={`${(avgProgress * 100).toFixed(0)}%`}
              progress={assets.length > 0 ? avgProgress : undefined}
            />
          </div>
        </section>

        <Separator className="mb-8" />

        {assets.length === 0 ? (
          <div className="py-24">
            <EmptyState
              title={tt('noAssets')}
              description={tt('createFirstDescription')}
              action={{ label: tt('createFirst'), href: '/assets/new' }}
            />
          </div>
        ) : (
          <>
            {nudges.length > 0 && (
              <section className="mb-8">
                <Card className="border-destructive/25 bg-destructive/5 p-0">
                  <CardHeader className="flex flex-row items-center gap-2 rounded-none border-b border-destructive/20 px-4 py-3">
                    <AlertCircle className="size-4 text-destructive" />
                    <CardTitle className="text-sm text-destructive">
                      {tt('nudgesHeading')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 px-4 py-3">
                    {nudges.map((nudge) => (
                      <div
                        key={nudge.assetId}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card px-3 py-2"
                      >
                        <p className="text-sm text-muted-foreground">
                          {tt('nudgeStale')
                            .replace('{name}', nudge.name)
                            .replace('{days}', String(nudge.daysSinceLastUse))}
                        </p>
                        <QuickLogButton assetId={nudge.assetId} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(['time', 'count', 'quota'] as const).map((type) => {
                const group = enriched.filter(({ asset }) => asset.type === type);
                const active = group.filter(({ asset }) => !asset.archivedAt);
                const archived = group.filter(({ asset }) => asset.archivedAt);
                const typeLabel = tt(
                  type === 'time' ? 'timeBased' : type === 'count' ? 'countBased' : 'quotaBased',
                );
                const typeStyles = TYPE_STYLES[type];
                return (
                  <Card key={type} className="gap-0 overflow-hidden p-0">
                    <CardHeader
                      className={cn(
                        'flex flex-row items-center justify-between gap-3 rounded-none border-b border-border/40 px-4 py-3',
                        typeStyles.tint,
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'flex size-8 items-center justify-center rounded-lg',
                            typeStyles.iconShell,
                          )}
                        >
                          {getTypeIcon(type)}
                        </div>
                        <CardTitle className={cn('text-sm font-semibold', typeStyles.accent)}>
                          {typeLabel}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary">{group.length}</Badge>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 px-4 py-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {tt('inUse')}
                      </p>
                      <div className="flex flex-col gap-3">
                        {active.length === 0 ? (
                          <EmptyState
                            title={tt('noActiveAssets')}
                            description={tt('addAssetOfType')}
                            className="py-6"
                          />
                        ) : (
                          active.map(({ asset, summary }) => (
                            <AssetCard key={asset.id} asset={asset} summary={summary} sym={sym} />
                          ))
                        )}
                      </div>

                      {archived.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-1.5">
                            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {tt('archived')}
                            </p>
                          </div>
                          {archived.map(({ asset, summary }) => (
                            <AssetCard
                              key={asset.id}
                              asset={asset}
                              summary={summary}
                              archived
                              sym={sym}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
