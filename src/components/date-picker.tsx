'use client';

import { format } from 'date-fns';
import { enUS, ja, zhCN, zhTW } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useMemo } from 'react';
import type { Locale as DayPickerLocale } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useI18n } from '@/lib/i18n';
import type { Locale as AppLocale } from '@/lib/i18n/locale';

const DATE_FNS_LOCALES: Record<AppLocale, DayPickerLocale> = {
  en: enUS,
  zh: zhCN,
  'zh-TW': zhTW,
  ja: ja,
};

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const { t, locale } = useI18n();
  const calendarLocale = useMemo(() => DATE_FNS_LOCALES[locale] ?? enUS, [locale]);
  const displayText = value ? format(value, 'yyyy-MM-dd') : (placeholder ?? t('pickDate'));

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" side="bottom" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2035, 11)}
          locale={calendarLocale}
        />
      </PopoverContent>
    </Popover>
  );
}
