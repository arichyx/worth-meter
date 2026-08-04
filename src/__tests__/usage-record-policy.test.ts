import { describe, expect, it } from 'vitest';
import { assertCanAddUsageRecord, canAddUsageRecord } from '@/lib/usage-record-policy';

describe('usage record policy', () => {
  it('allows usage records for active count-based assets', () => {
    const asset = { type: 'count' as const, archivedAt: null };

    expect(canAddUsageRecord(asset)).toBe(true);
    expect(() => assertCanAddUsageRecord(asset)).not.toThrow();
  });

  it('rejects usage records for archived count-based assets', () => {
    const asset = { type: 'count' as const, archivedAt: '2026-08-02T00:00:00.000Z' };

    expect(canAddUsageRecord(asset)).toBe(false);
    expect(() => assertCanAddUsageRecord(asset)).toThrow(
      'Cannot add a usage record to an archived count-based asset',
    );
  });

  it('rejects usage records for missing assets', () => {
    expect(() => assertCanAddUsageRecord(null)).toThrow('Asset not found');
  });
});
