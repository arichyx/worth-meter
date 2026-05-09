export type Currency = 'cny' | 'usd';

export const CURRENCY_COOKIE_NAME = 'worth-meter-currency';

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'cny', label: 'CNY', symbol: '¥' },
  { value: 'usd', label: 'USD', symbol: '$' },
];

export function isValidCurrency(v: string | null | undefined): v is Currency {
  return v === 'cny' || v === 'usd';
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES.find((c) => c.value === currency)?.symbol ?? '¥';
}
