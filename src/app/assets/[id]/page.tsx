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
import { getAssetWithRecords } from '@/lib/db/queries';
import type { AssetType } from '@/lib/db/schema';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';
import { CURRENCY_COOKIE_NAME, isValidCurrency, type Currency, getCurrencySymbol } from '@/lib/currency';
import { AssetChart } from './asset-chart';
import { DetailHeader } from './detail-header';
import { UsageDialog } from './usage-dialog';

function getTypeIcon(type: AssetType) {
  switch (type) {
    case 'time':
      return <Clock className="h-5 w-5" />;
    case 'count':
      return <Hash className="h-5 w-5" />;
    case 'quota':
      return <Layers className="h-5 w-5" />;
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

  return (
    <div className="min-h-screen bg-background">
      <DetailHeader asset={asset} />

      <main className="bg-spotlight max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="flex items-center gap-1.5">
                {getTypeIcon(asset.type)}
                {tt(
                  asset.type === 'time'
                    ? 'timeBased'
                    : asset.type === 'count'
                      ? 'countBased'
                      : 'quotaBased',
                )}
              </Badge>
              {asset.archivedAt && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <Archive className="h-3.5 w-3.5" />
                  {tt('archived')}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{asset.name}</h1>
            <p className="text-muted-foreground mt-1">
              {sym}{asset.totalCost.toLocaleString()} · {tt('purchasedOn')}{' '}
              {format(new Date(asset.purchaseDate), 'yyyy-MM-dd')}
            </p>
          </div>
          {asset.type !== 'time' && <UsageDialog assetId={id} assetType={asset.type} />}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {asset.type === 'time' &&
            (() => {
              const m = metrics as TimeBasedMetrics;
              return (
                <>
                  <MetricCard title={tt('dailyCost')} value={`${sym}${m.dailyCost.toFixed(1)}`} />
                  <MetricCard title={tt('daysUsed')} value={`${m.daysSincePurchase}`} />
                  <MetricCard title={tt('targetDays')} value={m.targetDays?.toString() ?? 'N/A'} />
                  <MetricCard
                    title={tt('breakEvenProgress')}
                    value={
                      m.breakEvenProgress !== null
                        ? `${(m.breakEvenProgress * 100).toFixed(0)}%`
                        : 'N/A'
                    }
                    progress={m.breakEvenProgress}
                  />
                </>
              );
            })()}
          {asset.type === 'count' &&
            (() => {
              const m = metrics as CountBasedMetrics;
              return (
                <>
                  <MetricCard title={tt('costPerUse')} value={`${sym}${m.costPerUse.toFixed(1)}`} />
                  <MetricCard title={tt('uses')} value={`${m.usedCount}`} />
                  <MetricCard
                    title={tt('targetUses')}
                    value={m.targetUseCount?.toString() ?? 'N/A'}
                  />
                  <MetricCard
                    title={tt('breakEvenProgress')}
                    value={
                      m.breakEvenProgress !== null
                        ? `${(m.breakEvenProgress * 100).toFixed(0)}%`
                        : 'N/A'
                    }
                    progress={m.breakEvenProgress}
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
                  />
                  <MetricCard
                    title={tt('valueRecovered')}
                    value={`${sym}${m.estimatedValue.toFixed(0)}`}
                  />
                  <MetricCard
                    title={tt('expectedWeeks')}
                    value={m.expectedWeeklyQuota.toFixed(1)}
                  />
                  <MetricCard title={tt('records')} value={`${m.recordCount}`} />
                </>
              );
            })()}
        </div>

        <Separator className="mb-8" />

        {/* Chart */}
        {asset.usageRecords.length > 0 && <AssetChart asset={asset} />}

        {/* Usage Records */}
        {asset.type !== 'time' && asset.usageRecords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tt('usageRecords')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...asset.usageRecords]
                  .sort(
                    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
                  )
                  .map((record, i) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          #{asset.usageRecords.length - i}
                        </span>
                        <span className="text-sm">
                          {asset.type === 'count'
                            ? tt('oneUse')
                            : `${tt('remaining')} ${record.value}%`}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(record.recordedAt), 'yyyy-MM-dd')}
                      </span>
                    </div>
                  ))}
              </div>
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
}: {
  title: string;
  value: string;
  progress?: number | null;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {progress !== null && progress !== undefined && (
          <Progress value={Math.min(progress * 100, 100)} className="h-1.5 mt-3" />
        )}
      </CardContent>
    </Card>
  );
}
