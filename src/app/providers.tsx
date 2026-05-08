'use client';

import { I18nProvider, type Locale } from '@/lib/i18n';

export function Providers({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return <I18nProvider initialLocale={locale}>{children}</I18nProvider>;
}
