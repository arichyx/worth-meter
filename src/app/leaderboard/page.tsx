import { ArrowRight, Clock, Hash, Layers, Sparkles, TriangleAlert } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { CurrencyToggle } from '@/components/currency-toggle';
import { EmptyState } from '@/components/empty-state';
import { LanguageToggle } from '@/components/language-toggle';
import { PageHeader } from '@/components/page-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  type AttentionReason,
  buildValueInsights,
  type RankedAsset,
  rankAssetsByObservedValue,
  type TypeValueInsight,
} from '@/lib/calculations';
import {
  CURRENCY_COOKIE_NAME,
  type Currency,
  getCurrencySymbol,
  isValidCurrency,
} from '@/lib/currency';
import { getAllAssetsWithRecords } from '@/lib/db/queries';
import type { AssetType } from '@/lib/db/schema';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import type { TranslationKey } from '@/lib/i18n/locales/en';
import { t } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

type FilterType = 'all' | AssetType;

const FILTERS: FilterType[] = ['all', 'time', 'count', 'quota'];

const TYPE_STYLES: Record<
  AssetType,
  {
    accent: string;
    tone: 'time' | 'count' | 'quota';
    badge: 'time' | 'count' | 'quota';
  }
> = {
  time: { accent: 'text-type-time', tone: 'time', badge: 'time' },
  count: { accent: 'text-type-count', tone: 'count', badge: 'count' },
  quota: { accent: 'text-type-quota', tone: 'quota', badge: 'quota' },
};

function typeIcon(type: AssetType) {
  if (type === 'time') return <Clock />;
  if (type === 'count') return <Hash />;
  return <Layers />;
}

function typeLabel(locale: Locale, type: AssetType) {
  return t(locale, type === 'time' ? 'timeBased' : type === 'count' ? 'countBased' : 'quotaBased');
}

function metricLabel(locale: Locale, type: AssetType) {
  const key: TranslationKey =
    type === 'time'
      ? 'holdingCostPerDay'
      : type === 'count'
        ? 'costPerRecordedUse'
        : 'actualUtilization';
  return t(locale, key);
}

function rankingBasis(locale: Locale, type: AssetType) {
  const key: TranslationKey =
    type === 'time'
      ? 'rankingBasisTime'
      : type === 'count'
        ? 'rankingBasisCount'
        : 'rankingBasisQuota';
  return t(locale, key);
}

function metricValue(ranked: RankedAsset, symbol: string) {
  if (ranked.type === 'quota') return `${(ranked.primaryMetric * 100).toFixed(0)}%`;
  return `${symbol}${ranked.primaryMetric.toFixed(2)}`;
}

function observationLabel(locale: Locale, ranked: RankedAsset) {
  const key: TranslationKey =
    ranked.type === 'time' ? 'daysHeld' : ranked.type === 'count' ? 'recordedUses' : 'quotaRecords';
  return t(locale, key).replace('{count}', String(ranked.observationCount));
}

function attentionLabel(locale: Locale, reason: AttentionReason) {
  const key: TranslationKey = reason === 'waitingForUsage' ? 'waitingForFirstUse' : reason;
  return t(locale, key);
}

function isFilterType(value: string | string[] | undefined): value is FilterType {
  return value === 'all' || value === 'time' || value === 'count' || value === 'quota';
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(COOKIE_NAME)?.value;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'zh';
  const rawCurrency = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  const currency: Currency = isValidCurrency(rawCurrency) ? rawCurrency : 'cny';
  const symbol = getCurrencySymbol(currency);

  const params = await searchParams;
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;
  const filter: FilterType = isFilterType(rawType) ? rawType : 'all';

  const assets = getAllAssetsWithRecords();
  const activeAssets = assets.filter((asset) => !asset.archivedAt);
  const insights = buildValueInsights(activeAssets);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        backHref="/"
        backLabel={t(locale, 'back')}
        title={t(locale, 'leaderboardTitle')}
        right={
          <>
            <ThemeToggle />
            <CurrencyToggle />
            <LanguageToggle />
          </>
        }
      />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">{t(locale, 'leaderboardDescription')}</p>

        <nav aria-label={t(locale, 'leaderboard')} className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const label = item === 'all' ? t(locale, 'filterAll') : typeLabel(locale, item);
            const href = item === 'all' ? '/leaderboard' : `/leaderboard?type=${item}`;
            const active = filter === item;

            return (
              <Link
                key={item}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/50',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {activeAssets.length === 0 ? (
          <EmptyState
            title={t(locale, 'leaderboardEmpty')}
            description={t(locale, 'createFirstDescription')}
            action={{ label: t(locale, 'createFirst'), href: '/assets/new' }}
          />
        ) : filter === 'all' ? (
          <ValueOverview insights={insights} locale={locale} symbol={symbol} />
        ) : (
          <TypeRanking
            ranked={rankAssetsByObservedValue(activeAssets, filter)}
            type={filter}
            locale={locale}
            symbol={symbol}
          />
        )}
      </main>
    </div>
  );
}

function ValueOverview({
  insights,
  locale,
  symbol,
}: {
  insights: TypeValueInsight[];
  locale: Locale;
  symbol: string;
}) {
  const available = insights.filter((insight) => insight.best);
  const attention = insights.filter((insight) => insight.attention && insight.attentionReason);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">{t(locale, 'valueOverview')}</h2>
          <p className="text-sm text-muted-foreground">{t(locale, 'valueOverviewDesc')}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {available.map((insight) => (
            <BestValueCard key={insight.type} insight={insight} locale={locale} symbol={symbol} />
          ))}
        </div>
      </section>

      {attention.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold">
              {t(locale, 'needsAttentionValue')}
            </h2>
            <p className="text-sm text-muted-foreground">{t(locale, 'needsAttentionValueDesc')}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attention.map((insight) => (
              <AttentionCard key={insight.type} insight={insight} locale={locale} symbol={symbol} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BestValueCard({
  insight,
  locale,
  symbol,
}: {
  insight: TypeValueInsight;
  locale: Locale;
  symbol: string;
}) {
  const ranked = insight.best as RankedAsset;
  const styles = TYPE_STYLES[ranked.type];

  return (
    <Link href={`/assets/${ranked.asset.id}`} className="block h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className={cn('size-4', styles.accent)} />
            {t(locale, 'bestValue')}
          </CardTitle>
          <CardDescription>{typeLabel(locale, ranked.type)}</CardDescription>
          <CardAction>
            <Badge variant={styles.badge}>
              {typeIcon(ranked.type)}
              {typeLabel(locale, ranked.type)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="truncate font-medium">{ranked.asset.name}</p>
          <div className="flex flex-col gap-0.5">
            <p className={cn('font-heading text-2xl font-semibold tabular-nums', styles.accent)}>
              {metricValue(ranked, symbol)}
            </p>
            <p className="text-xs text-muted-foreground">
              {metricLabel(locale, ranked.type)} · {observationLabel(locale, ranked)}
            </p>
          </div>
          <TargetProgress ranked={ranked} locale={locale} />
        </CardContent>
        <CardFooter className="mt-auto justify-between">
          <span className="text-xs text-muted-foreground">{t(locale, 'viewTypeRanking')}</span>
          <ArrowRight className="size-4 text-muted-foreground" />
        </CardFooter>
      </Card>
    </Link>
  );
}

function AttentionCard({
  insight,
  locale,
  symbol,
}: {
  insight: TypeValueInsight;
  locale: Locale;
  symbol: string;
}) {
  const ranked = insight.attention as RankedAsset;
  const reason = insight.attentionReason as AttentionReason;
  const styles = TYPE_STYLES[ranked.type];

  return (
    <Link href={`/assets/${ranked.asset.id}`} className="block h-full">
      <Card className="h-full" size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="size-4 text-muted-foreground" />
            {ranked.asset.name}
          </CardTitle>
          <CardDescription>{attentionLabel(locale, reason)}</CardDescription>
          <CardAction>
            <Badge variant={styles.badge}>{typeLabel(locale, ranked.type)}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {ranked.status === 'waitingForUsage'
              ? t(locale, 'waitingForFirstUseDesc')
              : metricLabel(locale, ranked.type)}
          </span>
          {ranked.status === 'ranked' && (
            <span className={cn('shrink-0 font-medium tabular-nums', styles.accent)}>
              {metricValue(ranked, symbol)}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function TypeRanking({
  ranked,
  type,
  locale,
  symbol,
}: {
  ranked: RankedAsset[];
  type: AssetType;
  locale: Locale;
  symbol: string;
}) {
  if (ranked.length === 0) {
    return (
      <EmptyState
        title={t(locale, 'noAssetsOfType')}
        description={rankingBasis(locale, type)}
        action={{ label: t(locale, 'createFirst'), href: '/assets/new' }}
      />
    );
  }

  return (
    <Card className="p-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="flex items-center gap-2">
          <Badge variant={TYPE_STYLES[type].badge}>
            {typeIcon(type)}
            {typeLabel(locale, type)}
          </Badge>
          {t(locale, 'detailedRanking')}
        </CardTitle>
        <CardDescription>{rankingBasis(locale, type)}</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border/40 p-0">
        {ranked.map((item) => (
          <LeaderboardRow key={item.asset.id} ranked={item} locale={locale} symbol={symbol} />
        ))}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({
  ranked,
  locale,
  symbol,
}: {
  ranked: RankedAsset;
  locale: Locale;
  symbol: string;
}) {
  const styles = TYPE_STYLES[ranked.type];

  return (
    <Link
      href={`/assets/${ranked.asset.id}`}
      className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40"
    >
      <span className="w-8 shrink-0 pt-0.5 text-center text-sm font-semibold tabular-nums text-muted-foreground">
        {ranked.rank ?? '—'}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{ranked.asset.name}</p>
            <p className="text-xs text-muted-foreground">
              {ranked.status === 'waitingForUsage'
                ? t(locale, 'waitingForFirstUseDesc')
                : observationLabel(locale, ranked)}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className={cn('text-sm font-medium tabular-nums', styles.accent)}>
              {ranked.status === 'waitingForUsage'
                ? t(locale, 'waitingForFirstUse')
                : metricValue(ranked, symbol)}
            </span>
            {ranked.status === 'ranked' && (
              <span className="text-xs text-muted-foreground">
                {metricLabel(locale, ranked.type)}
              </span>
            )}
          </div>
        </div>
        <TargetProgress ranked={ranked} locale={locale} />
      </div>
    </Link>
  );
}

function TargetProgress({ ranked, locale }: { ranked: RankedAsset; locale: Locale }) {
  if (ranked.targetProgress == null) return null;

  const styles = TYPE_STYLES[ranked.type];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{t(locale, 'targetProgress')}</span>
        <span className="tabular-nums">{(ranked.targetProgress * 100).toFixed(0)}%</span>
      </div>
      <Progress value={ranked.targetProgress * 100} tone={styles.tone} />
    </div>
  );
}
