'use client';

import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Locale, useI18n } from '@/lib/i18n';
import { LOCALES } from '@/lib/i18n/locale';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const current = LOCALES.find((l) => l.value === locale);

  return (
    <Select
      value={locale}
      onValueChange={(v) => {
        setLocale(v as Locale);
        router.refresh();
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={`${current?.flag ?? ''} ${current?.label ?? locale}`.trim()}
        className="size-7 justify-center gap-0 p-0 lg:w-fit lg:justify-between lg:gap-1.5 lg:px-2.5 [&>[data-slot=select-value]]:hidden [&>svg:last-child]:hidden lg:[&>[data-slot=select-value]]:flex lg:[&>svg:last-child]:block"
      >
        <Languages className="h-4 w-4" />
        <SelectValue>
          {current?.flag} {current?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.flag} {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
