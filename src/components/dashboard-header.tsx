'use client';

import { Landmark, Plus } from 'lucide-react';
import Link from 'next/link';
import { CurrencyToggle } from '@/components/currency-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export function DashboardHeader() {
  const { t } = useI18n();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Landmark className="h-7 w-7 text-amber-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
              <p className="text-xs text-muted-foreground">{t('appSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyToggle />
            <LanguageToggle />
            <Link href="/assets/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('newAsset')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
