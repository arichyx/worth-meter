import { Activity, Archive, Clock, Hash, Layers, Plus, TrendingUp, Wallet } from 'lucide-react';
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

// Per-type visual identity. Keep these Tailwind-arbitrary so the palette is
// explicit and independent of theme CSS vars.
const TYPE_STYLES: Record<AssetType, { accent: string; iconChip: string; cardBorder: string }> = {
  time: {
    accent: 'text-amber-600',
    iconChip: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700',
    cardBorder: 'border-l-2 border-l-amber-400/70',
  },
  count: {
    accent: 'text-sky-600',
    iconChip: 'bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700',
    cardBorder: 'border-l-2 border-l-sky-400/70',
  },
  quota: {
    accent: 'text-violet-600',
    iconChip: 'bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700',
    cardBorder: 'border-l-2 border-l-violet-400/70',
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

function computeSummary(locale: Locale, asset: AssetWithRecords): Summary {
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);
  switch (asset.type) {
    case 'time': {
      const m: TimeBasedMetrics = calculateTimeBased(asset);
      return {
        primary: `¥${m.dailyCost.toFixed(1)} / ${locale === 'zh' ? '天' : 'day'}`,
        secondary: `${tt('daysUsed')} ${m.daysSincePurchase} ${locale === 'zh' ? '天' : 'days'}`,
        progress: m.breakEvenProgress,
        label: m.isBreakEven ? tt('breakEvenReached') : undefined,
      };
    }
    case 'count': {
      const m: CountBasedMetrics = calculateCountBased(asset, asset.usageRecords);
      return {
        primary: `¥${m.costPerUse.toFixed(1)} / ${locale === 'zh' ? '次' : 'use'}`,
        secondary: `${tt('used')} ${m.usedCount} ${tt('times')}`,
        progress: m.breakEvenProgress,
        label: m.isBreakEven ? tt('breakEvenReached') : undefined,
      };
    }
    case 'quota': {
      const m: QuotaBasedMetrics = calculateQuotaBased(asset, asset.usageRecords);
      return {
        primary: `${tt('usageRate')} ${(m.usageRatio * 100).toFixed(0)}%`,
        secondary: `${tt('valueRecovered')} ¥${m.estimatedValue.toFixed(0)}`,
        progress: m.usageRatio > 1 ? 1 : m.usageRatio,
        label: m.usageRatio >= 1 ? tt('breakEvenReached') : undefined,
      };
    }
  }
}

function AssetCard({ asset, summary, archived }: AssetWithSummary & { archived?: boolean }) {
  const styles = TYPE_STYLES[asset.type];
  const broken = summary.label !== undefined;
  return (
    <Link href={`/assets/${asset.id}`} className="block">
      <Card
        size="sm"
        className={cn(
          'gap-2 py-3 transition-all cursor-pointer',
          'hover:shadow-md hover:-translate-y-0.5 hover:ring-foreground/20',
          styles.cardBorder,
          archived && 'opacity-60',
        )}
      >
        <CardHeader className="gap-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <CardTitle className="truncate">{asset.name}</CardTitle>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              ¥{asset.totalCost.toLocaleString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className={cn('text-xl font-bold tabular-nums', styles.accent)}>
              {summary.primary}
            </span>
            {summary.label && (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 shrink-0">
                {summary.label}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{summary.secondary}</p>
          {summary.progress !== null && (
            <Progress
              value={Math.min(summary.progress * 100, 100)}
              className={cn('h-1 mt-1', broken && '[&>div]:bg-emerald-500')}
            />
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
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);

  const assets = getAllAssetsWithRecords();

  // One pass: compute every summary once, then derive aggregates.
  const enriched: AssetWithSummary[] = assets.map((asset) => ({
    asset,
    summary: computeSummary(locale, asset),
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
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Soft ambient gradient behind the top of the page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.sky.100),transparent_60%)]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 ring-1 ring-blue-300/50">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{tt('totalInvested')}</p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight">
                    ¥{totalInvestment.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 text-green-700 ring-1 ring-green-300/50">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{tt('assets')}</p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 ring-1 ring-emerald-300/50">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{tt('breakEven')}</p>
                  <p className="text-2xl font-bold tabular-nums tracking-tight">
                    {breakEvenCount}{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      / {assets.length}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{tt('avgBreakEvenProgress')}</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {(avgProgress * 100).toFixed(0)}%
              </p>
            </div>
            <Progress value={avgProgress * 100} className="h-3" />
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        {assets.length === 0 ? (
          <div className="text-center py-20">
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
                <div key={type}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={cn('p-1.5 rounded-md', typeStyles.iconChip)}>
                      {getTypeIcon(type)}
                    </div>
                    <h2 className={cn('text-lg font-semibold', typeStyles.accent)}>{typeLabel}</h2>
                    <Badge variant="secondary">{group.length}</Badge>
                  </div>

                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {tt('inUse')}
                  </p>
                  <div className="space-y-3 mb-6">
                    {active.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">—</p>
                    ) : (
                      active.map(({ asset, summary }) => (
                        <AssetCard key={asset.id} asset={asset} summary={summary} />
                      ))
                    )}
                  </div>

                  {archived.length > 0 && (
                    <>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {tt('archived')}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {archived.map(({ asset, summary }) => (
                          <AssetCard key={asset.id} asset={asset} summary={summary} archived />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
