'use client';

import { I18nProvider, type Currency, type Locale } from '@/lib/i18n';

export function Providers({
  children,
  locale,
  currency,
}: {
  children: React.ReactNode;
  locale: Locale;
  currency: Currency;
}) {
  return (
    <I18nProvider initialLocale={locale} initialCurrency={currency}>
      {children}
    </I18nProvider>
  );
}
