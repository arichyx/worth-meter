'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Asset } from '@/lib/db/schema';
import { useI18n } from '@/lib/i18n';
import { ArchiveDialog } from './archive-dialog';
import { DeleteDialog } from './delete-dialog';
import { EditDialog } from './edit-dialog';

export function DetailHeader({ asset }: { asset: Asset }) {
  const { t } = useI18n();

  return (
    <header className="glass-header">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">{t('back')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <EditDialog asset={asset} />
            <ArchiveDialog assetId={asset.id} archived={!!asset.archivedAt} />
            <DeleteDialog assetId={asset.id} />
          </div>
        </div>
      </div>
    </header>
  );
}
