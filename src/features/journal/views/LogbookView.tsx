import { Archive } from "lucide-react";

interface LogbookViewProps {
  count: number;
}

export function LogbookView({ count }: LogbookViewProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="view-logbook"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
        <Archive className="h-8 w-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">
        No archived entries
      </h3>
      <p className="text-sm text-text-secondary max-w-sm">
        Completed and expired trades will appear here. You can still add them to your journal.
      </p>
      {count > 0 && (
        <p className="mt-4 text-xs text-text-tertiary">
          {count} archived entries
        </p>
      )}
    </div>
  );
}
