'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { type Currency, I18nProvider, type Locale } from '@/lib/i18n';
import type { Theme } from '@/lib/theme';

export function Providers({
  children,
  locale,
  currency,
  initialTheme,
}: {
  children: React.ReactNode;
  locale: Locale;
  currency: Currency;
  initialTheme: Theme;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <I18nProvider initialLocale={locale} initialCurrency={currency}>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
