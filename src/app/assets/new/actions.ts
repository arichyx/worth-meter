'use server';

import { createAsset } from '@/lib/db/queries';

export async function createAssetAction(formData: FormData) {
  const type = formData.get('type') as string;
  const name = formData.get('name') as string;
  const totalCost = parseFloat(formData.get('totalCost') as string);
  const purchaseDate = formData.get('purchaseDate') as string;

  const data: Record<string, unknown> = { name, type, totalCost, purchaseDate };

  if (type === 'count') {
    const expiryDate = formData.get('expiryDate') as string;
    const targetUnitCost = formData.get('targetUnitCost') as string;
    if (expiryDate) data.expiryDate = expiryDate;
    if (targetUnitCost) data.targetUnitCost = parseFloat(targetUnitCost);
  } else if (type === 'quota') {
    const billingCycleStart = formData.get('billingCycleStart') as string;
    const billingCycleEnd = formData.get('billingCycleEnd') as string;
    if (billingCycleStart) data.billingCycleStart = billingCycleStart;
    if (billingCycleEnd) data.billingCycleEnd = billingCycleEnd;
  } else if (type === 'time') {
    const targetDailyCost = formData.get('targetDailyCost') as string;
    const resaleValue = formData.get('resaleValue') as string;
    if (targetDailyCost) data.targetDailyCost = parseFloat(targetDailyCost);
    if (resaleValue) data.resaleValue = parseFloat(resaleValue);
  }

  const asset = createAsset(data as Parameters<typeof createAsset>[0]);
  return { id: asset!.id };
}
