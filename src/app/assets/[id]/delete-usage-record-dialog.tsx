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
import { deleteUsageRecordAction } from './actions';

export function DeleteUsageRecordDialog({ recordId }: { recordId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteUsageRecordAction(recordId);
        toast({ title: t('usageRecordDeleted'), variant: 'success' });
        setOpen(false);
        router.refresh();
      } catch {
        toast({ title: t('usageRecordDeleteFailed'), variant: 'destructive' });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('delete')}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteUsageRecordTitle')}</DialogTitle>
          <DialogDescription>{t('deleteUsageRecordDescription')}</DialogDescription>
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
