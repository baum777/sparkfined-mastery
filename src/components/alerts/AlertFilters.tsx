import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FilterType } from '@/features/alerts';

interface AlertFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onClear: () => void;
  resultsCount: number;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'triggered', label: 'Triggered' },
  { value: 'paused', label: 'Paused' },
];

export function AlertFilters({ filter, onFilterChange, onClear, resultsCount }: AlertFiltersProps) {
  return (
    <div 
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Alert filters"
    >
      {FILTER_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={filter === option.value ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange(option.value)}
          aria-pressed={filter === option.value}
          data-testid={`filter-${option.value}`}
        >
          {option.label}
        </Button>
      ))}

      {filter !== 'all' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground"
          aria-label="Clear filter"
          data-testid="filter-clear"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}

      <Badge variant="secondary" className="ml-auto">
        {resultsCount} {resultsCount === 1 ? 'alert' : 'alerts'}
      </Badge>
    </div>
  );
}
