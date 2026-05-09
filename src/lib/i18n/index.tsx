'use client';

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { CURRENCY_COOKIE_NAME, type Currency, getCurrencySymbol } from '@/lib/currency';
import { COOKIE_NAME, type Locale } from './locale';
import { en, type TranslationKey } from './locales/en';
import { ja } from './locales/ja';
import { zh } from './locales/zh';
import { zhTW } from './locales/zh-TW';

export type { Locale } from './locale';
export type { Currency } from '@/lib/currency';
export { getCurrencySymbol } from '@/lib/currency';

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  zh,
  'zh-TW': zhTW,
  ja,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

async function setCookie(name: string, value: string) {
  await cookieStore.set({
    name,
    value,
    path: '/',
    expires: Date.now() + 60 * 60 * 24 * 365 * 1000,
    sameSite: 'lax',
  });
}

export function I18nProvider({
  children,
  initialLocale,
  initialCurrency,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialCurrency: Currency;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setCookie(COOKIE_NAME, l);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    setCookie(CURRENCY_COOKIE_NAME, c);
  }, []);

  const t = useCallback((key: TranslationKey) => translations[locale][key], [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, currency, setCurrency, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
