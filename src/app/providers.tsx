'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider, type Currency, type Locale } from '@/lib/i18n';
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
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
