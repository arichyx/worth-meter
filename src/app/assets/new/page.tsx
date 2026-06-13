'use client';

import { format } from 'date-fns';
import { ArrowLeft, Clock, Hash, Layers } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { DatePicker } from '@/components/date-picker';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { AssetType } from '@/lib/db/schema';
import { useI18n } from '@/lib/i18n';
import { createAssetAction } from './actions';

export default function NewAssetPage() {
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<AssetType | null>(null);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());

  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [targetUnitCost, setTargetUnitCost] = useState('');

  const [billingCycleStart, setBillingCycleStart] = useState<Date | undefined>(undefined);
  const [billingCycleEnd, setBillingCycleEnd] = useState<Date | undefined>(undefined);

  const [targetDailyCost, setTargetDailyCost] = useState('');
  const [resaleValue, setResaleValue] = useState('');

  const assetTypes = [
    { value: 'time' as AssetType, icon: <Clock className="h-5 w-5" /> },
    { value: 'count' as AssetType, icon: <Hash className="h-5 w-5" /> },
    { value: 'quota' as AssetType, icon: <Layers className="h-5 w-5" /> },
  ];
  const namePlaceholder = t(
    selectedType === 'time'
      ? 'timeNamePlaceholder'
      : selectedType === 'count'
        ? 'countNamePlaceholder'
        : 'quotaNamePlaceholder',
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType || !name || !totalCost || !purchaseDate) return;

    const formData = new FormData();
    formData.set('type', selectedType);
    formData.set('name', name);
    formData.set('totalCost', totalCost);
    formData.set('purchaseDate', format(purchaseDate, 'yyyy-MM-dd'));

    if (selectedType === 'time') {
      if (targetDailyCost) formData.set('targetDailyCost', targetDailyCost);
      if (resaleValue) formData.set('resaleValue', resaleValue);
    } else if (selectedType === 'count') {
      if (expiryDate) formData.set('expiryDate', format(expiryDate, 'yyyy-MM-dd'));
      if (targetUnitCost) formData.set('targetUnitCost', targetUnitCost);
    } else if (selectedType === 'quota') {
      if (billingCycleStart)
        formData.set('billingCycleStart', format(billingCycleStart, 'yyyy-MM-dd'));
      if (billingCycleEnd) formData.set('billingCycleEnd', format(billingCycleEnd, 'yyyy-MM-dd'));
    }

    startTransition(() => {
      createAssetAction(formData);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">{t('back')}</span>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="bg-spotlight max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold mb-2">{t('newAssetTitle')}</h2>
        <p className="text-muted-foreground mb-8">{t('newAssetDescription')}</p>

        {!selectedType ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {assetTypes.map((at) => (
              <Card
                key={at.value}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedType(at.value)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    {at.icon}
                    <CardTitle className="text-lg">
                      {t(
                        at.value === 'time'
                          ? 'timeBased'
                          : at.value === 'count'
                            ? 'countBased'
                            : 'quotaBased',
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      at.value === 'time'
                        ? 'timeDescription'
                        : at.value === 'count'
                          ? 'countDescription'
                          : 'quotaDescription',
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {assetTypes.find((at) => at.value === selectedType)?.icon}
                  <CardTitle>
                    {t(
                      selectedType === 'time'
                        ? 'timeBased'
                        : selectedType === 'count'
                          ? 'countBased'
                          : 'quotaBased',
                    )}
                  </CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSelectedType(null)}
                >
                  {t('change')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('name')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={namePlaceholder}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalCost">
                        {t('totalCost')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="totalCost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={totalCost}
                        onChange={(e) => setTotalCost(e.target.value)}
                        placeholder={t('totalCostPlaceholder')}
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
                </div>

                <Separator />

                {selectedType === 'time' && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">{t('timeFields')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="targetDailyCost">{t('targetDailyCost')}</Label>
                        <Input
                          id="targetDailyCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={targetDailyCost}
                          onChange={(e) => setTargetDailyCost(e.target.value)}
                          placeholder={t('targetDailyCostPlaceholder')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resaleValue">{t('resaleValue')}</Label>
                        <Input
                          id="resaleValue"
                          type="number"
                          min="0"
                          step="0.01"
                          value={resaleValue}
                          onChange={(e) => setResaleValue(e.target.value)}
                          placeholder={t('resaleValuePlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'count' && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">{t('countFields')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('expiryDate')}</Label>
                        <DatePicker value={expiryDate} onChange={setExpiryDate} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetUnitCost">{t('targetUnitCost')}</Label>
                        <Input
                          id="targetUnitCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={targetUnitCost}
                          onChange={(e) => setTargetUnitCost(e.target.value)}
                          placeholder={t('targetUnitCostPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === 'quota' && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">{t('quotaFields')}</p>
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
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={pending}>
                    {pending ? t('creating') : t('createAsset')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedType(null)}>
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
