'use client';

import { Landmark, Plus, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { CurrencyToggle } from '@/components/currency-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { PageHeader } from '@/components/page-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
  const { t } = useI18n();

  return (
    <PageHeader
      left={
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg border border-border/40 bg-card text-foreground shadow-sm sm:size-10">
            <Landmark className="size-5" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold tracking-tight">{t('appName')}</h1>
            <p className="text-xs text-muted-foreground">{t('appSubtitle')}</p>
          </div>
        </div>
      }
      right={
        <>
          <ThemeToggle />
          <CurrencyToggle />
          <LanguageToggle />
          <Link
            href="/simulate"
            aria-label={t('simulate')}
            className={cn(buttonVariants({ variant: 'outline' }), 'px-2 xl:px-2.5')}
          >
            <Sparkles data-icon="inline-start" />
            <span className="hidden xl:inline">{t('simulate')}</span>
          </Link>
          <Link
            href="/leaderboard"
            aria-label={t('leaderboard')}
            className={cn(buttonVariants({ variant: 'outline' }), 'px-2 xl:px-2.5')}
          >
            <Trophy data-icon="inline-start" />
            <span className="hidden xl:inline">{t('leaderboard')}</span>
          </Link>
          <Link
            href="/assets/new"
            aria-label={t('newAsset')}
            className={cn(buttonVariants(), 'px-2 xl:px-2.5')}
          >
            <Plus data-icon="inline-start" />
            <span className="hidden xl:inline">{t('newAsset')}</span>
          </Link>
        </>
      }
    />
  );
}
