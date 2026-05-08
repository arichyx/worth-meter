export type Locale = 'en' | 'zh' | 'zh-TW' | 'ja';

export const COOKIE_NAME = 'worth-meter-locale';

export const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: 'zh', label: '简体中文', flag: '🇨🇳' },
  { value: 'zh-TW', label: '繁體中文', flag: '🇨🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
];

export function isValidLocale(v: string | null | undefined): v is Locale {
  return v === 'en' || v === 'zh' || v === 'zh-TW' || v === 'ja';
}
