'use client';

import { Archive, ArchiveRestore } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';
import { archiveAssetAction, unarchiveAssetAction } from './actions';

export function ArchiveDialog({ assetId, archived }: { assetId: string; archived: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleAction() {
    startTransition(async () => {
      try {
        if (archived) {
          await unarchiveAssetAction(assetId);
          toast({ title: t('assetUnarchived'), variant: 'success' });
        } else {
          await archiveAssetAction(assetId);
          toast({ title: t('assetArchived'), variant: 'success' });
        }
        router.refresh();
        setOpen(false);
      } catch {
        toast({ title: t('assetArchiveFailed'), variant: 'destructive' });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={archived ? t('unarchive') : t('archive')}
            className="px-2 xl:px-2.5"
          >
            {archived ? (
              <>
                <ArchiveRestore data-icon="inline-start" />
                <span className="hidden xl:inline">{t('unarchive')}</span>
              </>
            ) : (
              <>
                <Archive data-icon="inline-start" />
                <span className="hidden xl:inline">{t('archive')}</span>
              </>
            )}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {archived ? t('unarchiveConfirmTitle') : t('archiveConfirmTitle')}
          </DialogTitle>
          <DialogDescription>
            {archived ? t('unarchiveConfirmDescription') : t('archiveConfirmDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button className="flex-1" onClick={handleAction} disabled={pending}>
            {pending ? t('submitting') : archived ? t('unarchive') : t('archive')}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
