'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/components/theme-provider';
import { THEME_OPTIONS, type Theme } from '@/lib/theme';

const ICONS: Record<Theme, ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const current = THEME_OPTIONS.find((o) => o.value === theme);

  return (
    <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
      <SelectTrigger size="sm" className="gap-1.5">
        {ICONS[theme]}
        <SelectValue>{current?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {THEME_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="inline-flex items-center gap-2">
              {ICONS[o.value]}
              {o.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
