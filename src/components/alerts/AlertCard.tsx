import { Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Alert } from '@/features/alerts';

interface AlertCardProps {
  alert: Alert;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_STYLES: Record<Alert['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  triggered: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  paused: 'bg-muted text-muted-foreground border-border',
};

const BORDER_ACCENT: Record<Alert['status'], string> = {
  active: 'border-l-emerald-500',
  triggered: 'border-l-amber-500',
  paused: 'border-l-transparent',
};

export function AlertCard({ alert, onToggle, onDelete }: AlertCardProps) {
  return (
    <Card 
      data-testid={`alert-card-${alert.id}`}
      tabIndex={0}
      className={`border-l-2 ${BORDER_ACCENT[alert.status]} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">{alert.symbol}</span>
            <Badge variant="outline" className={STATUS_STYLES[alert.status]}>
              {alert.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {alert.condition} ${alert.targetPrice.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(alert.id)}
            aria-label={alert.status === 'active' ? 'Pause alert' : 'Activate alert'}
            data-testid={`btn-toggle-${alert.id}`}
            className="focus-visible:ring-2 focus-visible:ring-ring"
          >
            {alert.status === 'active' ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(alert.id)}
            aria-label="Delete alert"
            className="text-destructive hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
            data-testid={`btn-delete-${alert.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
