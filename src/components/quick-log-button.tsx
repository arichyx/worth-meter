'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { addUsageRecordAction } from '@/app/assets/[id]/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface QuickLogButtonProps {
  assetId: string;
  className?: string;
}

/** One-tap count usage logger. Records value=1 via the existing server action,
 *  then refreshes the dashboard in place. Must be rendered as a sibling of (not
 *  nested inside) any navigation link so the click does not navigate. */
export function QuickLogButton({ assetId, className }: QuickLogButtonProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await addUsageRecordAction(assetId, 1);
        toast({ title: t('useLogged'), variant: 'success' });
        router.refresh();
      } catch {
        toast({ title: t('useLogFailed'), variant: 'destructive' });
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      aria-label={t('quickLog')}
      className={cn('gap-1 px-2', className)}
    >
      <Plus className="size-3.5" />
      <span className="text-xs font-medium">+1</span>
    </Button>
  );
}
