import { cookies } from 'next/headers';
import { CurrencyToggle } from '@/components/currency-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { PageHeader } from '@/components/page-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { deriveHistoricalVelocity, type TrackRecord } from '@/lib/calculations';
import { getAllAssetsWithRecords } from '@/lib/db/queries';
import type { AssetType } from '@/lib/db/schema';
import { COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n/locale';
import { t } from '@/lib/i18n/server';
import { SimulatorForm } from './simulator-form';

export default async function SimulatePage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  const locale: Locale = isValidLocale(raw) ? raw : 'zh';
  const tt = (key: Parameters<typeof t>[1]) => t(locale, key);
  const nowIso = new Date().toISOString();

  const assets = getAllAssetsWithRecords();
  const trackByType: Record<AssetType, TrackRecord> = {
    time: deriveHistoricalVelocity(assets, 'time', nowIso),
    count: deriveHistoricalVelocity(assets, 'count', nowIso),
    quota: deriveHistoricalVelocity(assets, 'quota', nowIso),
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        backHref="/"
        backLabel={tt('back')}
        title={tt('simulateTitle')}
        right={
          <>
            <ThemeToggle />
            <CurrencyToggle />
            <LanguageToggle />
          </>
        }
      />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mb-8 text-sm text-muted-foreground">{tt('simulateDescription')}</p>
        <SimulatorForm nowIso={nowIso} trackByType={trackByType} />
      </main>
    </div>
  );
}
