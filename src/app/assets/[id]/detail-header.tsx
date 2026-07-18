'use client';

import { CurrencyToggle } from '@/components/currency-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { PageHeader } from '@/components/page-header';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Asset } from '@/lib/db/schema';
import { useI18n } from '@/lib/i18n';
import { ArchiveDialog } from './archive-dialog';
import { DeleteDialog } from './delete-dialog';
import { EditDialog } from './edit-dialog';

export function DetailHeader({ asset }: { asset: Asset }) {
  const { t } = useI18n();

  return (
    <PageHeader
      backHref="/"
      backLabel={t('back')}
      title={asset.name}
      right={
        <>
          <ThemeToggle />
          <CurrencyToggle />
          <LanguageToggle />
          <EditDialog asset={asset} />
          <ArchiveDialog assetId={asset.id} archived={!!asset.archivedAt} />
          <DeleteDialog assetId={asset.id} />
        </>
      }
    />
  );
}
