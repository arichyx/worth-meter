'use client';

import { Clock, Hash, Layers, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cloneElement, type ReactElement, useId, useMemo, useState } from 'react';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { type SimulationInput, simulatePurchase, type TrackRecord } from '@/lib/calculations';
import type { AssetType } from '@/lib/db/schema';
import { getCurrencySymbol, useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface SimulatorFormProps {
  nowIso: string;
  trackByType: Record<AssetType, TrackRecord>;
}

const TYPES: { value: AssetType; icon: typeof Clock }[] = [
  { value: 'count', icon: Hash },
  { value: 'time', icon: Clock },
  { value: 'quota', icon: Layers },
];

function num(s: string): number | undefined {
  if (s.trim() === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export function SimulatorForm({ nowIso, trackByType }: SimulatorFormProps) {
  const { t, locale, currency } = useI18n();
  const sym = getCurrencySymbol(currency);

  const [type, setType] = useState<AssetType>('count');
  const [totalCost, setTotalCost] = useState('1200');
  const [purchaseDate, setPurchaseDate] = useState(nowIso.slice(0, 10));
  const [targetUnitCost, setTargetUnitCost] = useState('60');
  const [targetDailyCost, setTargetDailyCost] = useState('50');
  const [resaleValue, setResaleValue] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [billingCycleStart, setBillingCycleStart] = useState('');
  const [billingCycleEnd, setBillingCycleEnd] = useState('');
  const [expectedUsesPerWeek, setExpectedUsesPerWeek] = useState('3');
  const [expectedUsageRatio, setExpectedUsageRatio] = useState('80');

  const input: SimulationInput = useMemo(() => {
    const base: SimulationInput = {
      type,
      totalCost: num(totalCost) ?? 0,
      purchaseDate,
    };
    if (type === 'count') {
      base.targetUnitCost = num(targetUnitCost) ?? null;
      base.expiryDate = expiryDate || null;
      base.expectedUsesPerWeek = num(expectedUsesPerWeek) ?? null;
    } else if (type === 'time') {
      base.targetDailyCost = num(targetDailyCost) ?? null;
      base.resaleValue = num(resaleValue) ?? null;
    } else {
      base.billingCycleStart = billingCycleStart || null;
      base.billingCycleEnd = billingCycleEnd || null;
      base.expectedUsageRatio = num(expectedUsageRatio) ?? null;
    }
    return base;
  }, [
    type,
    totalCost,
    purchaseDate,
    targetUnitCost,
    targetDailyCost,
    resaleValue,
    expiryDate,
    billingCycleStart,
    billingCycleEnd,
    expectedUsesPerWeek,
    expectedUsageRatio,
  ]);

  const result = useMemo(
    () => simulatePurchase(input, trackByType[type], nowIso),
    [input, trackByType, type, nowIso],
  );

  const track = trackByType[type];
  const typeLabel =
    type === 'time' ? t('timeBased') : type === 'count' ? t('countBased') : t('quotaBased');
  const accent =
    type === 'time' ? 'text-type-time' : type === 'count' ? 'text-type-count' : 'text-type-quota';

  const verdictBadge =
    result.verdict === 'worth-it'
      ? { variant: 'success' as const, label: t('simVerdictWorthIt') }
      : result.verdict === 'on-the-fence'
        ? { variant: 'secondary' as const, label: t('simVerdictOnTheFence') }
        : result.verdict === 'unlikely'
          ? { variant: 'destructive' as const, label: t('simVerdictUnlikely') }
          : null;

  const costUnitLabel =
    type === 'count' ? t('costPerUse') : type === 'time' ? t('dailyCost') : t('valueRecovered');
  const recentMetricLabel =
    type === 'count' ? t('costPerUse') : type === 'time' ? t('dailyCost') : t('usageRate');
  const fmtCost = (v: number | null) =>
    v == null ? '—' : type === 'quota' ? `${sym}${v.toFixed(0)}` : `${sym}${v.toFixed(1)}`;
  const fmtRecentMetric = (v: number | null) =>
    v == null ? '—' : type === 'quota' ? `${(v * 100).toFixed(0)}%` : `${sym}${v.toFixed(1)}`;

  const paceStr = useMemo(() => {
    if (!track.hasHistory || track.velocity == null) return null;
    const v = track.velocity;
    if (track.velocityKind === 'usesPerDay')
      return t('simPaceUsesPerDay').replace('{v}', v.toFixed(2));
    if (track.velocityKind === 'costPerDay')
      return t('simPaceCostPerDay').replace('{sym}', sym).replace('{v}', v.toFixed(1));
    return t('simPaceUsageRatio').replace('{v}', (v * 100).toFixed(0));
  }, [track, sym, t]);

  const breakEvenStr =
    result.projectedBreakEvenDate != null
      ? t('simBreakEvenDate').replace(
          '{date}',
          new Date(result.projectedBreakEvenDate).toLocaleDateString(
            locale === 'zh' ? 'zh-CN' : locale,
            {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            },
          ),
        )
      : null;
  const breakEvenDaysStr =
    result.projectedBreakEvenDays != null
      ? t('simBreakEvenDays').replace(
          '{days}',
          Math.round(result.projectedBreakEvenDays).toString(),
        )
      : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Inputs */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className={cn('size-5', accent)} />
            {typeLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-all',
                  type === value
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/30'
                    : 'border-border/60 text-muted-foreground hover:bg-muted/50',
                )}
              >
                <Icon className="size-4" />
                {value === 'time'
                  ? t('timeBased')
                  : value === 'count'
                    ? t('countBased')
                    : t('quotaBased')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('totalCost')}>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder={t('totalCostPlaceholder')}
              />
            </Field>
            <Field label={t('purchaseDate')}>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </Field>
          </div>

          {type === 'count' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t('targetUnitCost')}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetUnitCost}
                  onChange={(e) => setTargetUnitCost(e.target.value)}
                  placeholder={t('targetUnitCostPlaceholder')}
                />
              </Field>
              <Field label={t('expectedUsesPerWeek')}>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={expectedUsesPerWeek}
                  onChange={(e) => setExpectedUsesPerWeek(e.target.value)}
                  placeholder={t('expectedUsesPerWeekPlaceholder')}
                />
              </Field>
              <Field label={t('expiryDate')}>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </Field>
            </div>
          )}

          {type === 'time' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t('targetDailyCost')}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetDailyCost}
                  onChange={(e) => setTargetDailyCost(e.target.value)}
                  placeholder={t('targetDailyCostPlaceholder')}
                />
              </Field>
              <Field label={t('resaleValue')}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={resaleValue}
                  onChange={(e) => setResaleValue(e.target.value)}
                  placeholder={t('resaleValuePlaceholder')}
                />
              </Field>
            </div>
          )}

          {type === 'quota' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={t('billingCycleStart')}>
                <Input
                  type="date"
                  value={billingCycleStart}
                  onChange={(e) => setBillingCycleStart(e.target.value)}
                />
              </Field>
              <Field label={t('billingCycleEnd')}>
                <Input
                  type="date"
                  value={billingCycleEnd}
                  onChange={(e) => setBillingCycleEnd(e.target.value)}
                />
              </Field>
              <Field label={t('expectedUsageRatio')}>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={expectedUsageRatio}
                  onChange={(e) => setExpectedUsageRatio(e.target.value)}
                  placeholder={t('expectedUsageRatioPlaceholder')}
                />
              </Field>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result + track record */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                {t('simProjection')}
              </span>
              {verdictBadge ? (
                <Badge variant={verdictBadge.variant}>{verdictBadge.label}</Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.verdict ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">{t('simBreakEven')}</p>
                  <p className={cn('mt-1 text-2xl font-semibold tabular-nums', accent)}>
                    {breakEvenStr ?? '—'}
                  </p>
                  {breakEvenDaysStr && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{breakEvenDaysStr}</p>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <HorizonStat
                    label={t('simAt6Months')}
                    value={fmtCost(result.costPerUnitAt6m)}
                    unit={costUnitLabel}
                  />
                  <HorizonStat
                    label={t('simAt12Months')}
                    value={fmtCost(result.costPerUnitAt12m)}
                    unit={costUnitLabel}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.basis === 'history' ? t('simBasisHistory') : t('simBasisExpected')}
                </p>
                {result.verdict === 'on-the-fence' && (
                  <p className="rounded-md border border-border/60 bg-muted/40 p-2 text-xs text-muted-foreground">
                    {t('simGapWarning')}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('simNoVerdict')}</p>
            )}

            <Link
              href="/assets/new"
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
            >
              {t('simCreateAsset')}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('simTrackRecord')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {track.hasHistory && paceStr ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">{t('simYourPace')}</p>
                  <p className={cn('mt-0.5 text-lg font-semibold tabular-nums', accent)}>
                    {paceStr}
                  </p>
                </div>
                {track.recentAsset && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('simRecentAsset').replace('{type}', typeLabel)}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium">
                        {track.recentAsset.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {recentMetricLabel}: {fmtRecentMetric(track.recentAsset.costPerUnit)}
                      </p>
                      {track.recentAsset.breakEvenProgress != null && (
                        <div className="mt-2 flex items-center gap-2">
                          <Progress
                            value={Math.min(track.recentAsset.breakEvenProgress * 100, 100)}
                            tone={type}
                            className="min-w-0 flex-1"
                          />
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {Math.min(track.recentAsset.breakEvenProgress * 100, 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <EmptyState title={t('simNoHistory').replace('{type}', typeLabel)} className="py-6" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactElement<{ id?: string }> }) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, { id })}
    </div>
  );
}

function HorizonStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{unit}</p>
    </div>
  );
}
