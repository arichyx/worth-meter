import { Archive, Clock, Hash, Layers, Plus } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { getAllAssetsWithRecords } from '@/lib/db/queries';
import type { Asset, AssetType, UsageRecord } from '@/lib/db/schema';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';
import { CURRENCY_COOKIE_NAME, isValidCurrency, type Currency, getCurrencySymbol } from '@/lib/currency';
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

// Per-type visual identity, driven by the cross-mode type tokens.
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

function AssetCard({ asset, summary, archived, sym }: AssetWithSummary & { archived?: boolean; sym: string }) {
  const styles = TYPE_STYLES[asset.type];
  return (
    <Link href={`/assets/${asset.id}`} className="block">
      <Card
        size="sm"
        className={cn(
          'gap-2 py-3 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5',
          archived && 'opacity-60',
        )}
      >
        <CardHeader className="gap-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <CardTitle className="truncate">{asset.name}</CardTitle>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {sym}{asset.totalCost.toLocaleString()}
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
            <Progress value={Math.min(summary.progress * 100, 100)} className="h-1 mt-1" />
          )}
        </CardContent>
      </Card>
    </Link>
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

      <main className="bg-spotlight max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Overview — each figure shown once (no duplication).
            Total invested (hero) + average break-even progress (right),
            with asset / break-even counts as a quiet line. */}
        <section className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="relative isolate">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10 rounded-full bg-primary/40 blur-3xl dark:bg-primary/20"
              />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {tt('totalInvested')}
              </p>
              <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums">
                {sym}
                {totalInvestment.toLocaleString()}
              </p>
            </div>
            <div className="sm:w-80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {tt('avgBreakEvenProgress')}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {(avgProgress * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={avgProgress * 100} className="h-1.5 mt-2.5" />
            </div>
          </div>
          <p className="mt-5 text-sm text-muted-foreground tabular-nums">
            {assets.length} {tt('assets')} · {breakEvenCount} {tt('breakEven')}
          </p>
        </section>

        <Separator className="mb-8" />

        {assets.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg text-muted-foreground mb-4">{tt('noAssets')}</p>
            <Link href="/assets/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {tt('createFirst')}
              </Button>
            </Link>
          </div>
        ) : (
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
                      'flex flex-row items-center justify-between gap-3 rounded-none border-b border-border/40 px-4 py-3.5',
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
                  <CardContent className="flex flex-col gap-4 px-4 py-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {tt('inUse')}
                    </p>
                    <div className="flex flex-col gap-3">
                      {active.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">—</p>
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
        )}
      </main>
    </div>
  );
}
