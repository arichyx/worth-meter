import type { VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  } & Omit<VariantProps<typeof buttonVariants>, 'onClick' | 'children'>;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const actionButton = action
    ? (() => {
        const { label, onClick, href, ...buttonProps } = action;
        if (href) {
          return (
            <Link href={href} onClick={onClick} className={buttonVariants(buttonProps)}>
              {label}
            </Link>
          );
        }

        return (
          <Button {...buttonProps} onClick={onClick}>
            {label}
          </Button>
        );
      })()
    : null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/50 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actionButton}
    </div>
  );
}
