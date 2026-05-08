'use server';

import { redirect } from 'next/navigation';
import {
  addUsageRecord,
  archiveAsset,
  deleteAsset,
  unarchiveAsset,
  updateAsset,
} from '@/lib/db/queries';

export async function deleteAssetAction(assetId: string) {
  deleteAsset(assetId);
  redirect('/');
}

export async function addUsageRecordAction(assetId: string, value: number, recordedAt?: string) {
  addUsageRecord(assetId, value, recordedAt);
}

export async function updateAssetAction(assetId: string, data: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== '') {
      clean[key] = value;
    } else {
      clean[key] = null;
    }
  }
  updateAsset(assetId, clean);
}

export async function archiveAssetAction(assetId: string) {
  archiveAsset(assetId);
}

export async function unarchiveAssetAction(assetId: string) {
  unarchiveAsset(assetId);
}
