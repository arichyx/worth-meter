'use client';

import { Trash2 } from 'lucide-react';
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
import { deleteAssetAction } from './actions';

export function DeleteDialog({ assetId }: { assetId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteAssetAction(assetId);
        toast({ title: t('assetDeleted'), variant: 'success' });
        router.push('/');
      } catch {
        toast({ title: t('assetDeleteFailed'), variant: 'destructive' });
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
            aria-label={t('delete')}
            className="px-2 text-destructive hover:text-destructive xl:px-2.5"
          >
            <Trash2 data-icon="inline-start" />
            <span className="hidden xl:inline">{t('delete')}</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          <DialogDescription>{t('deleteConfirmDescription')}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? t('submitting') : t('delete')}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
