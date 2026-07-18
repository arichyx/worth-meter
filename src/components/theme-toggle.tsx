'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '@/components/theme-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <SelectTrigger
        size="sm"
        aria-label={`Theme: ${current?.label ?? theme}`}
        className="size-7 justify-center gap-0 p-0 lg:w-fit lg:justify-between lg:gap-1.5 lg:px-2.5 [&>[data-slot=select-value]]:hidden [&>svg:last-child]:hidden lg:[&>[data-slot=select-value]]:flex lg:[&>svg:last-child]:block"
      >
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
