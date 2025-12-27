import { BookOpen } from "lucide-react";

interface ConfirmedViewProps {
  count: number;
}

export function ConfirmedView({ count }: ConfirmedViewProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 text-center"
      data-testid="view-confirmed"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
        <BookOpen className="h-8 w-8 text-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2">
        No journal entries yet
      </h3>
      <p className="text-sm text-text-secondary max-w-sm">
        Confirm pending trades with your notes and emotions to build your trading journal.
      </p>
      {count > 0 && (
        <p className="mt-4 text-xs text-text-tertiary">
          {count} confirmed entries
        </p>
      )}
    </div>
  );
}
