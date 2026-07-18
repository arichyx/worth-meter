import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { CURRENCY_COOKIE_NAME, type Currency, isValidCurrency } from '@/lib/currency';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import {
  DEFAULT_THEME,
  htmlThemeClass,
  isValidTheme,
  THEME_COOKIE_NAME,
  THEME_INIT_SCRIPT,
  type Theme,
} from '@/lib/theme';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WorthMeter',
  description: 'Track whether your purchases have paid for themselves',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const locale: Locale = isValidLocale(raw) ? raw : 'zh';
  const rawCurrency = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  const currency: Currency = isValidCurrency(rawCurrency) ? rawCurrency : 'cny';

  const rawTheme = cookieStore.get(THEME_COOKIE_NAME)?.value;
  const theme: Theme = isValidTheme(rawTheme) ? rawTheme : DEFAULT_THEME;
  // SSR class for <html>. suppressHydrationWarning: the inline pre-paint script
  // may correct 'system'/unknown to prefers-color-scheme before hydration.
  const themeClass = htmlThemeClass(isValidTheme(rawTheme) ? rawTheme : null);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${themeClass}`.trim()}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        {/* Pre-paint theme resolver — no flash of wrong theme. Runs synchronously. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Sync inline theme resolver to avoid FOUC before hydration. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Providers locale={locale} currency={currency} initialTheme={theme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
