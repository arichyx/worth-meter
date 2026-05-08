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
import { useI18n } from '@/lib/i18n';
import { archiveAssetAction, unarchiveAssetAction } from './actions';

export function ArchiveDialog({ assetId, archived }: { assetId: string; archived: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleAction() {
    startTransition(() => {
      if (archived) {
        unarchiveAssetAction(assetId);
      } else {
        archiveAssetAction(assetId);
      }
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm">
            {archived ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-1" />
                {t('unarchive')}
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-1" />
                {t('archive')}
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
