'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { THEME_COOKIE_NAME, type Theme } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/** Apply a theme preference to the document root immediately (no round-trip). */
function applyTheme(theme: Theme) {
  const dark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}

async function persistTheme(theme: Theme) {
  try {
    await cookieStore.set({
      name: THEME_COOKIE_NAME,
      value: theme,
      path: '/',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });
  } catch {
    // Cookie Store API unavailable — the inline script still resolves on reload.
  }
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // When following the system theme, keep the DOM in sync if the OS preference changes.
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    void persistTheme(next);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
