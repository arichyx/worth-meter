'use client';

import { format } from 'date-fns';
import { Check, Clock, Hash, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CurrencyToggle } from '@/components/currency-toggle';
import { DatePicker } from '@/components/date-picker';
import { LanguageToggle } from '@/components/language-toggle';
import { PageHeader } from '@/components/page-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast';
import type { AssetType } from '@/lib/db/schema';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { createAssetAction } from './actions';

interface FormState {
  type: AssetType | null;
  name: string;
  totalCost: string;
  purchaseDate: Date | undefined;
  // time
  targetDailyCost: string;
  resaleValue: string;
  // count
  expiryDate: Date | undefined;
  targetUnitCost: string;
  // quota
  billingCycleStart: Date | undefined;
  billingCycleEnd: Date | undefined;
}

interface FormErrors {
  name?: string;
  totalCost?: string;
  purchaseDate?: string;
  targetDailyCost?: string;
  resaleValue?: string;
  expiryDate?: string;
  targetUnitCost?: string;
  billingCycleStart?: string;
  billingCycleEnd?: string;
}

const INITIAL_STATE: FormState = {
  type: null,
  name: '',
  totalCost: '',
  purchaseDate: new Date(),
  targetDailyCost: '',
  resaleValue: '',
  expiryDate: undefined,
  targetUnitCost: '',
  billingCycleStart: undefined,
  billingCycleEnd: undefined,
};

export default function NewAssetPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pending, startTransition] = useTransition();

  const assetTypes = [
    { value: 'time' as AssetType, icon: <Clock className="h-5 w-5" /> },
    { value: 'count' as AssetType, icon: <Hash className="h-5 w-5" /> },
    { value: 'quota' as AssetType, icon: <Layers className="h-5 w-5" /> },
  ];

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev, [field]: undefined };
      if (field === 'purchaseDate' || field === 'expiryDate') next.expiryDate = undefined;
      if (field === 'billingCycleStart' || field === 'billingCycleEnd') {
        next.billingCycleStart = undefined;
        next.billingCycleEnd = undefined;
      }
      return next;
    });
  }

  function validateStep2(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = t('requiredField');
    if (!form.totalCost.trim()) {
      next.totalCost = t('requiredField');
    } else if (Number.isNaN(Number(form.totalCost)) || Number(form.totalCost) < 0) {
      next.totalCost = t('invalidNumber');
    }
    if (!form.purchaseDate) next.purchaseDate = t('requiredField');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep3(): boolean {
    const next: FormErrors = {};
    if (form.type === 'time') {
      if (
        form.targetDailyCost &&
        (Number.isNaN(Number(form.targetDailyCost)) || Number(form.targetDailyCost) < 0)
      ) {
        next.targetDailyCost = t('invalidNumber');
      }
      if (
        form.resaleValue &&
        (Number.isNaN(Number(form.resaleValue)) || Number(form.resaleValue) < 0)
      ) {
        next.resaleValue = t('invalidNumber');
      }
    } else if (form.type === 'count') {
      if (
        form.targetUnitCost &&
        (Number.isNaN(Number(form.targetUnitCost)) || Number(form.targetUnitCost) < 0)
      ) {
        next.targetUnitCost = t('invalidNumber');
      }
      if (
        form.expiryDate &&
        form.purchaseDate &&
        form.expiryDate.getTime() <= form.purchaseDate.getTime()
      ) {
        next.expiryDate = t('invalidDateRange');
      }
    } else if (form.type === 'quota') {
      if (form.billingCycleStart && !form.billingCycleEnd) {
        next.billingCycleEnd = t('requiredField');
      } else if (!form.billingCycleStart && form.billingCycleEnd) {
        next.billingCycleStart = t('requiredField');
      } else if (
        form.billingCycleStart &&
        form.billingCycleEnd &&
        form.billingCycleEnd.getTime() <= form.billingCycleStart.getTime()
      ) {
        next.billingCycleEnd = t('invalidDateRange');
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!form.type || !validateStep3()) return;

    const formData = new FormData();
    formData.set('type', form.type);
    formData.set('name', form.name.trim());
    formData.set('totalCost', form.totalCost);
    formData.set('purchaseDate', format(form.purchaseDate!, 'yyyy-MM-dd'));

    if (form.type === 'time') {
      if (form.targetDailyCost) formData.set('targetDailyCost', form.targetDailyCost);
      if (form.resaleValue) formData.set('resaleValue', form.resaleValue);
    } else if (form.type === 'count') {
      if (form.expiryDate) formData.set('expiryDate', format(form.expiryDate, 'yyyy-MM-dd'));
      if (form.targetUnitCost) formData.set('targetUnitCost', form.targetUnitCost);
    } else if (form.type === 'quota') {
      if (form.billingCycleStart)
        formData.set('billingCycleStart', format(form.billingCycleStart, 'yyyy-MM-dd'));
      if (form.billingCycleEnd)
        formData.set('billingCycleEnd', format(form.billingCycleEnd, 'yyyy-MM-dd'));
    }

    startTransition(async () => {
      try {
        const { id } = await createAssetAction(formData);
        toast({ title: t('assetCreated'), variant: 'success' });
        router.push(`/assets/${id}`);
      } catch {
        toast({ title: t('assetCreateFailed'), variant: 'destructive' });
      }
    });
  }

  const stepLabels = [t('chooseType'), t('basicInfo'), t('detailsAndSubmit')];

  function selectType(type: AssetType) {
    setForm((prev) => ({ ...prev, type }));
    setStep(2);
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        backHref="/"
        backLabel={t('back')}
        title={t('newAssetTitle')}
        right={
          <>
            <ThemeToggle />
            <CurrencyToggle />
            <LanguageToggle />
          </>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('newAssetTitle')}</h2>
            <span className="text-sm text-muted-foreground">
              {t('stepIndicator').replace('{step}', String(step)).replace('{total}', '3')}
            </span>
          </div>
          <Progress value={(step / 3) * 100} className="h-1.5" />
          <div className="flex flex-wrap gap-2">
            {stepLabels.map((label, idx) => {
              const active = idx + 1 === step;
              const completed = idx + 1 < step;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-1.5 text-sm ${
                    active ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-xs ${
                      completed
                        ? 'bg-primary text-primary-foreground'
                        : active
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {completed ? <Check className="size-3" /> : idx + 1}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {assetTypes.map((at) => (
              <Card
                key={at.value}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  form.type === at.value && 'ring-2 ring-primary',
                )}
                role="button"
                tabIndex={0}
                aria-pressed={form.type === at.value}
                onClick={() => selectType(at.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectType(at.value);
                  }
                }}
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
        )}

        {step >= 2 && form.type && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {assetTypes.find((at) => at.value === form.type)?.icon}
                  <CardTitle>
                    {t(
                      form.type === 'time'
                        ? 'timeBased'
                        : form.type === 'count'
                          ? 'countBased'
                          : 'quotaBased',
                    )}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  {t('change')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('name')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder={t(
                          form.type === 'time'
                            ? 'timeNamePlaceholder'
                            : form.type === 'count'
                              ? 'countNamePlaceholder'
                              : 'quotaNamePlaceholder',
                        )}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
                        value={form.totalCost}
                        onChange={(e) => updateField('totalCost', e.target.value)}
                        placeholder={t('totalCostPlaceholder')}
                      />
                      {errors.totalCost && (
                        <p className="text-xs text-destructive">{errors.totalCost}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('purchaseDate')} <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      value={form.purchaseDate}
                      onChange={(d) => updateField('purchaseDate', d)}
                    />
                    {errors.purchaseDate && (
                      <p className="text-xs text-destructive">{errors.purchaseDate}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      {t('back')}
                    </Button>
                    <Button onClick={() => validateStep2() && setStep(3)}>{t('next')}</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <>
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
                    <h3 className="mb-3 text-sm font-medium">{t('summary')}</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{t('type')}</span>
                        <span className="font-medium">
                          {t(
                            form.type === 'time'
                              ? 'timeBased'
                              : form.type === 'count'
                                ? 'countBased'
                                : 'quotaBased',
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{t('name')}</span>
                        <span className="font-medium">{form.name}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{t('totalCost')}</span>
                        <span className="font-medium">{form.totalCost}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{t('purchaseDate')}</span>
                        <span className="font-medium">
                          {form.purchaseDate ? format(form.purchaseDate, 'yyyy-MM-dd') : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t(
                        form.type === 'time'
                          ? 'timeFields'
                          : form.type === 'count'
                            ? 'countFields'
                            : 'quotaFields',
                      )}
                    </p>

                    {form.type === 'time' && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="targetDailyCost">{t('targetDailyCost')}</Label>
                          <Input
                            id="targetDailyCost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.targetDailyCost}
                            onChange={(e) => updateField('targetDailyCost', e.target.value)}
                            placeholder={t('targetDailyCostPlaceholder')}
                          />
                          {errors.targetDailyCost && (
                            <p className="text-xs text-destructive">{errors.targetDailyCost}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resaleValue">{t('resaleValue')}</Label>
                          <Input
                            id="resaleValue"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.resaleValue}
                            onChange={(e) => updateField('resaleValue', e.target.value)}
                            placeholder={t('resaleValuePlaceholder')}
                          />
                          {errors.resaleValue && (
                            <p className="text-xs text-destructive">{errors.resaleValue}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {form.type === 'count' && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{t('expiryDate')}</Label>
                          <DatePicker
                            value={form.expiryDate}
                            onChange={(d) => updateField('expiryDate', d)}
                          />
                          {errors.expiryDate && (
                            <p className="text-xs text-destructive">{errors.expiryDate}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="targetUnitCost">{t('targetUnitCost')}</Label>
                          <Input
                            id="targetUnitCost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.targetUnitCost}
                            onChange={(e) => updateField('targetUnitCost', e.target.value)}
                            placeholder={t('targetUnitCostPlaceholder')}
                          />
                          {errors.targetUnitCost && (
                            <p className="text-xs text-destructive">{errors.targetUnitCost}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {form.type === 'quota' && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{t('billingCycleStart')}</Label>
                          <DatePicker
                            value={form.billingCycleStart}
                            onChange={(d) => updateField('billingCycleStart', d)}
                          />
                          {errors.billingCycleStart && (
                            <p className="text-xs text-destructive">{errors.billingCycleStart}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>{t('billingCycleEnd')}</Label>
                          <DatePicker
                            value={form.billingCycleEnd}
                            onChange={(d) => updateField('billingCycleEnd', d)}
                          />
                          {errors.billingCycleEnd && (
                            <p className="text-xs text-destructive">{errors.billingCycleEnd}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(2)} disabled={pending}>
                      {t('back')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={pending}>
                      {pending ? t('creating') : t('createAsset')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
