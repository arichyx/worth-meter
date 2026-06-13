'use client';

import { format } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltip, useChartTheme } from '@/components/charts/chart-theme';
import { calculateTimeBased } from '@/lib/calculations';
import type { Asset, UsageRecord } from '@/lib/db/schema';
import { getCurrencySymbol, useI18n } from '@/lib/i18n';

interface AssetWithRecords extends Asset {
  usageRecords: UsageRecord[];
}

function buildChartData(asset: AssetWithRecords) {
  if (asset.type === 'time') {
    const metrics = calculateTimeBased(asset);
    const days = Math.min(metrics.daysSincePurchase, 365);
    const points: { label: string; dailyCost: number; days: number }[] = [];
    for (let d = 1; d <= days; d += Math.max(1, Math.floor(days / 30))) {
      points.push({
        label: `Day ${d}`,
        dailyCost: Math.round((metrics.effectiveCost / d) * 100) / 100,
        days: d,
      });
    }
    return points;
  }
  if (asset.type === 'count') {
    const sorted = [...asset.usageRecords].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );
    return sorted.map((r, i) => ({
      label: format(new Date(r.recordedAt), 'MM/dd'),
      costPerUse: Math.round((asset.totalCost / (i + 1)) * 100) / 100,
      uses: i + 1,
    }));
  }
  // quota
  const sorted = [...asset.usageRecords].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  return sorted.map((r) => ({
    label: format(new Date(r.recordedAt), 'MM/dd'),
    usedPercent: 100 - r.value,
    remaining: r.value,
  }));
}

export function AssetChart({ asset }: { asset: AssetWithRecords }) {
  const { t: tt, currency } = useI18n();
  const sym = getCurrencySymbol(currency);
  const theme = useChartTheme();
  const chartData = buildChartData(asset);

  const color =
    asset.type === 'time'
      ? (theme?.colors.time ?? '')
      : asset.type === 'count'
        ? (theme?.colors.count ?? '')
        : (theme?.colors.quota ?? '');
  const seriesName =
    asset.type === 'time'
      ? tt('dailyCost')
      : asset.type === 'count'
        ? tt('costPerUse')
        : tt('usageRate');
  const formatValue =
    asset.type === 'quota'
      ? (v: number) => `${v}%`
      : (v: number) => `${sym}${v.toFixed(2)}`;

  const axisProps = {
    tick: { fontSize: 12, fill: theme?.colors.axis ?? 'currentColor' },
    tickLine: false,
    axisLine: false,
  } as const;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">
          {asset.type === 'time' && tt('dailyCostTrend')}
          {asset.type === 'count' && tt('costPerUseTrend')}
          {asset.type === 'quota' && tt('usageTrend')}
        </CardTitle>
        <CardDescription>
          {asset.type === 'time' && tt('dailyCostTrendDesc')}
          {asset.type === 'count' && tt('costPerUseTrendDesc')}
          {asset.type === 'quota' && tt('usageTrendDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          {theme && (
            <ResponsiveContainer width="100%" height="100%">
              {asset.type === 'time' ? (
                <AreaChart data={chartData as { label: string; dailyCost: number; days: number }[]}>
                  <defs>
                    <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={<ChartTooltip formatValue={formatValue} />}
                    cursor={{ stroke: theme.colors.grid, strokeOpacity: 0.4, strokeWidth: 1 }}
                  />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis width={44} {...axisProps} />
                  <Area
                    type="monotone"
                    dataKey="dailyCost"
                    name={seriesName}
                    stroke={color}
                    strokeWidth={2}
                    fill="url(#grad-area)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              ) : asset.type === 'count' ? (
                <AreaChart
                  data={chartData as { label: string; costPerUse: number; uses: number }[]}
                >
                  <defs>
                    <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={<ChartTooltip formatValue={formatValue} />}
                    cursor={{ stroke: theme.colors.grid, strokeOpacity: 0.4, strokeWidth: 1 }}
                  />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis width={44} {...axisProps} />
                  <Area
                    type="monotone"
                    dataKey="costPerUse"
                    name={seriesName}
                    stroke={color}
                    strokeWidth={2}
                    fill="url(#grad-area)"
                    dot={{ r: 3, strokeWidth: 0, fill: color }}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={chartData as { label: string; usedPercent: number; remaining: number }[]}
                >
                  <defs>
                    <linearGradient id="grad-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={<ChartTooltip formatValue={formatValue} />}
                    cursor={{ fill: theme.colors.grid, fillOpacity: 0.1 }}
                  />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis width={44} {...axisProps} />
                  <Bar dataKey="usedPercent" name={seriesName} fill="url(#grad-bar)" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
