import type { Locale } from './locale';
import { en, type TranslationKey } from './locales/en';
import { ja } from './locales/ja';
import { zh } from './locales/zh';
import { zhTW } from './locales/zh-TW';

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  zh,
  'zh-TW': zhTW,
  ja,
};

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}
