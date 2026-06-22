'use client';

import { Landmark, Plus } from 'lucide-react';
import Link from 'next/link';
import { CurrencyToggle } from '@/components/currency-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export function DashboardHeader() {
  const { t } = useI18n();

  return (
    <header className="glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-18 items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-border/40 bg-card text-foreground shadow-sm">
              <Landmark className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{t('appName')}</h1>
              <p className="text-xs text-muted-foreground">{t('appSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CurrencyToggle />
            <LanguageToggle />
            <Link href="/assets/new">
              <Button>
                <Plus data-icon="inline-start" />
                {t('newAsset')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
