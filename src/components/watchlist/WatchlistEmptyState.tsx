import { Eye, Plus, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WatchlistEmptyStateProps {
  onAddClick: () => void;
}

export function WatchlistEmptyState({ onAddClick }: WatchlistEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
        <Eye className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No symbols in watchlist</h2>
      <p className="text-muted-foreground max-w-sm mb-6">
        Add symbols you're monitoring for potential trades. Track trends and jump into analysis quickly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onAddClick} data-testid="watchlist-add-first">
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Symbol
        </Button>
        <Button variant="outline" asChild>
          <a href="/chart">
            <LineChart className="h-4 w-4 mr-2" />
            Browse Chart
          </a>
        </Button>
      </div>
    </div>
  );
}
