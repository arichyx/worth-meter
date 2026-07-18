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
import { CURRENCIES } from '@/lib/currency';
import { type Currency, useI18n } from '@/lib/i18n';

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
      <SelectTrigger
        size="sm"
        aria-label={`${current?.symbol ?? ''} ${current?.label ?? currency}`.trim()}
        className="size-7 justify-center gap-0 p-0 lg:w-fit lg:justify-between lg:gap-1.5 lg:px-2.5 [&>[data-slot=select-value]]:hidden [&>svg:last-child]:hidden lg:[&>[data-slot=select-value]]:flex lg:[&>svg:last-child]:block"
      >
        <Coins className="h-4 w-4" />
        <SelectValue>
          {current?.symbol} {current?.label}
        </SelectValue>
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
