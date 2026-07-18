import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OverviewCardProps {
  title: string;
  value: string;
  helper?: string;
  progress?: number | null;
  className?: string;
}

export function OverviewCard({ title, value, helper, progress, className }: OverviewCardProps) {
  const hasProgress = progress !== null && progress !== undefined;

  return (
    <Card className={cn('border-border/40 bg-card shadow-sm', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hasProgress && (
          <div className="space-y-1.5">
            <Progress value={Math.min(progress * 100, 100)} className="h-1.5" />
            {helper && <p className="text-xs text-muted-foreground tabular-nums">{helper}</p>}
          </div>
        )}
        {!hasProgress && helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}
