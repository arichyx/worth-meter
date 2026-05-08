'use client';

import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AssetType } from '@/lib/db/schema';
import { useI18n } from '@/lib/i18n';
import { addUsageRecordAction } from './actions';

export function UsageDialog({ assetId, assetType }: { assetId: string; assetType: AssetType }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [usageValue, setUsageValue] = useState('');
  const [useDate, setUseDate] = useState<Date | undefined>(new Date());
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    const value = assetType === 'count' ? 1 : parseFloat(usageValue);
    if (assetType === 'quota' && Number.isNaN(value)) return;

    const recordedAt = assetType === 'count' && useDate ? format(useDate, 'yyyy-MM-dd') : undefined;

    startTransition(() => {
      addUsageRecordAction(assetId, value, recordedAt);
      setUsageValue('');
      setUseDate(new Date());
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {assetType === 'count' ? t('logUse') : t('logReset')}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{assetType === 'count' ? t('logUseTitle') : t('logResetTitle')}</DialogTitle>
          <DialogDescription>
            {assetType === 'count' ? t('logUseDescription') : t('logResetDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {assetType === 'count' ? (
            <div className="space-y-2">
              <Label>{t('useDate')}</Label>
              <DatePicker value={useDate} onChange={setUseDate} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="remaining">{t('remainingQuota')}</Label>
              <Input
                id="remaining"
                type="number"
                min="0"
                max="100"
                value={usageValue}
                onChange={(e) => setUsageValue(e.target.value)}
                placeholder={t('remainingPlaceholder')}
              />
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full" disabled={pending}>
            {pending ? t('submitting') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
