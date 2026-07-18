'use client';

import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
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
import { useToast } from '@/components/ui/toast';
import type { Asset } from '@/lib/db/schema';
import { useI18n } from '@/lib/i18n';
import { updateAssetAction } from './actions';

interface EditDialogProps {
  asset: Asset;
}

export function EditDialog({ asset }: EditDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(asset.name);
  const [totalCost, setTotalCost] = useState(String(asset.totalCost));
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date(asset.purchaseDate));

  // Count
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    asset.expiryDate ? new Date(asset.expiryDate) : undefined,
  );
  const [targetUnitCost, setTargetUnitCost] = useState(
    asset.targetUnitCost != null ? String(asset.targetUnitCost) : '',
  );

  // Quota
  const [billingCycleStart, setBillingCycleStart] = useState<Date | undefined>(
    asset.billingCycleStart ? new Date(asset.billingCycleStart) : undefined,
  );
  const [billingCycleEnd, setBillingCycleEnd] = useState<Date | undefined>(
    asset.billingCycleEnd ? new Date(asset.billingCycleEnd) : undefined,
  );

  // Time
  const [targetDailyCost, setTargetDailyCost] = useState(
    asset.targetDailyCost != null ? String(asset.targetDailyCost) : '',
  );
  const [resaleValue, setResaleValue] = useState(
    asset.resaleValue != null ? String(asset.resaleValue) : '',
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !totalCost || !purchaseDate) return;

    const data: Record<string, unknown> = {
      name,
      totalCost: parseFloat(totalCost),
      purchaseDate: format(purchaseDate, 'yyyy-MM-dd'),
    };

    if (asset.type === 'time') {
      data.targetDailyCost = targetDailyCost ? parseFloat(targetDailyCost) : '';
      data.resaleValue = resaleValue ? parseFloat(resaleValue) : '';
    } else if (asset.type === 'count') {
      data.expiryDate = expiryDate ? format(expiryDate, 'yyyy-MM-dd') : '';
      data.targetUnitCost = targetUnitCost ? parseFloat(targetUnitCost) : '';
    } else if (asset.type === 'quota') {
      data.billingCycleStart = billingCycleStart ? format(billingCycleStart, 'yyyy-MM-dd') : '';
      data.billingCycleEnd = billingCycleEnd ? format(billingCycleEnd, 'yyyy-MM-dd') : '';
    }

    startTransition(async () => {
      try {
        await updateAssetAction(asset.id, data);
        setOpen(false);
        toast({ title: t('assetUpdated'), variant: 'success' });
        router.refresh();
      } catch {
        toast({ title: t('assetUpdateFailed'), variant: 'destructive' });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" aria-label={t('edit')} className="px-2 xl:px-2.5">
            <Pencil data-icon="inline-start" />
            <span className="hidden xl:inline">{t('edit')}</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editAsset')}</DialogTitle>
          <DialogDescription>{t('editAssetDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                {t('name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cost">
                {t('totalCost')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-cost"
                type="number"
                min="0"
                step="0.01"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>
              {t('purchaseDate')} <span className="text-destructive">*</span>
            </Label>
            <DatePicker value={purchaseDate} onChange={setPurchaseDate} />
          </div>

          {asset.type === 'time' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-daily">{t('targetDailyCost')}</Label>
                <Input
                  id="edit-daily"
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetDailyCost}
                  onChange={(e) => setTargetDailyCost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-resale">{t('resaleValue')}</Label>
                <Input
                  id="edit-resale"
                  type="number"
                  min="0"
                  step="0.01"
                  value={resaleValue}
                  onChange={(e) => setResaleValue(e.target.value)}
                />
              </div>
            </div>
          )}

          {asset.type === 'count' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('expiryDate')}</Label>
                <DatePicker value={expiryDate} onChange={setExpiryDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-target-unit">{t('targetUnitCost')}</Label>
                <Input
                  id="edit-target-unit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetUnitCost}
                  onChange={(e) => setTargetUnitCost(e.target.value)}
                />
              </div>
            </div>
          )}

          {asset.type === 'quota' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('billingCycleStart')}</Label>
                <DatePicker value={billingCycleStart} onChange={setBillingCycleStart} />
              </div>
              <div className="space-y-2">
                <Label>{t('billingCycleEnd')}</Label>
                <DatePicker value={billingCycleEnd} onChange={setBillingCycleEnd} />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t('saving') : t('save')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
