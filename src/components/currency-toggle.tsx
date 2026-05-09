'use client';

import { Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Currency, useI18n } from '@/lib/i18n';
import { CURRENCIES } from '@/lib/currency';

export function CurrencyToggle() {
  const { currency, setCurrency } = useI18n();
  const router = useRouter();
  const current = CURRENCIES.find((c) => c.value === currency);

  return (
    <Select
      value={currency}
      onValueChange={(v) => {
        setCurrency(v as Currency);
        router.refresh();
      }}
    >
      <SelectTrigger size="sm" className="gap-1.5">
        <Coins className="h-4 w-4" />
        <SelectValue>{current?.symbol} {current?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.symbol} {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
