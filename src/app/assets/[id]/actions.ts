'use server';

import {
  addUsageRecord,
  archiveAsset,
  deleteAsset,
  deleteUsageRecord,
  unarchiveAsset,
  updateAsset,
} from '@/lib/db/queries';

export async function deleteAssetAction(assetId: string) {
  deleteAsset(assetId);
}

export async function addUsageRecordAction(assetId: string, value: number, recordedAt?: string) {
  addUsageRecord(assetId, value, recordedAt);
}

export async function deleteUsageRecordAction(recordId: string) {
  deleteUsageRecord(recordId);
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
