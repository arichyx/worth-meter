'use client';

import { useEffect, useState } from 'react';

/**
 * Chart colors resolved from the design tokens at runtime. The asset-type hues
 * and brand are mode-invariant; grid/axis differ per mode and are re-read when
 * the theme changes. Recharts needs concrete color strings (it cannot consume
 * CSS variables in SVG presentation attributes), so we read computed values.
 */
export interface ChartColors {
  brand: string;
  time: string;
  count: string;
  quota: string;
  teal: string;
  grid: string;
  axis: string;
}

export interface ChartTheme {
  colors: ChartColors;
  isDark: boolean;
}

function readVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function readTheme(): ChartTheme {
  return {
    colors: {
      brand: readVar('--primary'),
      time: readVar('--type-time'),
      count: readVar('--type-count'),
      quota: readVar('--type-quota'),
      teal: readVar('--chart-5'),
      grid: readVar('--border'),
      axis: readVar('--muted-foreground'),
    },
    isDark: document.documentElement.classList.contains('dark'),
  };
}

/**
 * Resolve chart colors + dark flag, re-reading whenever the theme class on
 * <html> changes (user toggle or OS preference change).
 */
export function useChartTheme(): ChartTheme | null {
  const [theme, setTheme] = useState<ChartTheme | null>(null);
  useEffect(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
  formatValue?: (value: number) => string;
}

/** Glass tooltip rendered as HTML (so it can use backdrop-blur + theme tokens). */
export function ChartTooltip({ active, payload, label, formatValue }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1.5 font-medium text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((p, i) => {
          const v =
            typeof p.value === 'number'
              ? formatValue
                ? formatValue(p.value)
                : p.value.toString()
              : (p.value ?? '');
          return (
            <div key={i} className="flex items-center gap-2 tabular-nums">
              <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-muted-foreground">{p.name}</span>
              <span className="ml-auto font-medium text-foreground">{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
