'use client';

import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateTimeBased } from '@/lib/calculations';
import type { Asset, UsageRecord } from '@/lib/db/schema';
import { useI18n } from '@/lib/i18n';

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
  const { t: tt } = useI18n();
  const chartData = buildChartData(asset);

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
          <ResponsiveContainer width="100%" height="100%">
            {asset.type === 'time' ? (
              <LineChart data={chartData as { label: string; dailyCost: number; days: number }[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => [`¥${value}`, 'Daily Cost']} />
                <Line
                  type="monotone"
                  dataKey="dailyCost"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : asset.type === 'count' ? (
              <LineChart data={chartData as { label: string; costPerUse: number; uses: number }[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => [`¥${value}`, 'Cost/Use']} />
                <Line
                  type="monotone"
                  dataKey="costPerUse"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={chartData as { label: string; usedPercent: number; remaining: number }[]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Used %']} />
                <Bar dataKey="usedPercent" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
