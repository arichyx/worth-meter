'use client';

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { COOKIE_NAME, type Locale } from './locale';
import { en, type TranslationKey } from './locales/en';
import { ja } from './locales/ja';
import { zh } from './locales/zh';
import { zhTW } from './locales/zh-TW';

export type { Locale } from './locale';

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  zh,
  'zh-TW': zhTW,
  ja,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

async function setCookie(locale: Locale) {
  await cookieStore.set({
    name: COOKIE_NAME,
    value: locale,
    path: '/',
    expires: Date.now() + 60 * 60 * 24 * 365 * 1000,
    sameSite: 'lax',
  });
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setCookie(l);
  }, []);

  const t = useCallback((key: TranslationKey) => translations[locale][key], [locale]);

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
