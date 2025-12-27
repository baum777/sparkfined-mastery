import { Inbox } from "lucide-react";

interface PendingViewProps {
  count: number;
}

export function PendingView({ count }: PendingViewProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="view-pending"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
        <Inbox className="h-8 w-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">
        No pending trades
      </h3>
      <p className="text-sm text-text-secondary max-w-sm">
        Enable wallet monitoring to auto-capture your swaps. Trades will appear here for 24h before archiving.
      </p>
      {count > 0 && (
        <p className="mt-4 text-xs text-text-tertiary">
          {count} entries in queue
        </p>
      )}
    </div>
  );
}
