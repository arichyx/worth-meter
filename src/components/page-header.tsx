'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  left?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  left,
  backHref,
  backLabel,
  title,
  subtitle,
  right,
  className,
}: PageHeaderProps) {
  const renderedLeft =
    left ??
    (backHref ? (
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel && <span>{backLabel}</span>}
      </Link>
    ) : null);

  return (
    <header className={cn('glass-header', className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-2 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {renderedLeft}
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>}
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          )}
        </div>
        {right && <div className="flex shrink-0 items-center gap-1 sm:gap-2">{right}</div>}
      </div>
    </header>
  );
}
