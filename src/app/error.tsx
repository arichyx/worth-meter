'use client';

import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { useI18n } from '@/lib/i18n';

export default function ErrorPage({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <EmptyState
        icon={<AlertTriangle className="size-6" />}
        title={t('errorTitle')}
        description={t('errorDescription')}
        action={{ label: t('retry'), onClick: unstable_retry, variant: 'default' }}
      />
    </div>
  );
}
