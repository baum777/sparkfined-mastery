import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type EntryType = "buy" | "sell" | "hold";

interface JournalEntry {
  id: string;
  title: string;
  description: string;
  symbol: string;
  type: EntryType;
  date: Date;
}

interface RecentEntriesCardProps {
  entries?: JournalEntry[];
  onViewJournal?: () => void;
  onViewEntry?: (id: string) => void;
}

const typeConfig: Record<EntryType, { label: string; className: string }> = {
  buy: { label: "Buy", className: "bg-success/20 text-success border-success/30" },
  sell: { label: "Sell", className: "bg-destructive/20 text-destructive border-destructive/30" },
  hold: { label: "Hold", className: "bg-muted text-muted-foreground border-border" },
};

function EntryCard({ entry, onView }: { entry: JournalEntry; onView?: () => void }) {
  const config = typeConfig[entry.type];

  return (
    <Card className="min-w-[200px] flex-shrink-0 bg-card/50" data-testid={`recent-entry-${entry.id}`}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={cn("text-xs", config.className)}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{entry.symbol}</span>
        </div>
        <h4 className="font-medium text-sm line-clamp-1">{entry.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{entry.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {format(entry.date, "MMM dd, yyyy")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-primary hover:text-primary/80"
            onClick={onView}
          >
            View <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentEntriesCard({
  entries = [],
  onViewJournal,
  onViewEntry,
}: RecentEntriesCardProps) {
  const mockEntries: JournalEntry[] = entries.length > 0 ? entries : [
    {
      id: "1",
      title: "BTC breakout retest",
      description: "Scaled in after reclaim of key level.",
      symbol: "BTC",
      type: "buy",
      date: new Date(2024, 4, 20),
    },
    {
      id: "2",
      title: "ETH range fade",
      description: "Took profit at prior week high.",
      symbol: "ETH",
      type: "sell",
      date: new Date(2024, 4, 20),
    },
    {
      id: "3",
      title: "SOL momentum ride",
      description: "Riding higher lows structure.",
      symbol: "SOL",
      type: "buy",
      date: new Date(2024, 4, 19),
    },
    {
      id: "4",
      title: "AVAX patience entry",
      description: "Staying in swing as plan holds.",
      symbol: "AVAX",
      type: "hold",
      date: new Date(2024, 4, 18),
    },
    {
      id: "5",
      title: "ATOM consolidation watch",
      description: "Waiting for range resolution.",
      symbol: "ATOM",
      type: "hold",
      date: new Date(2024, 4, 18),
    },
  ];

  return (
    <Card className="w-full" data-testid="dashboard-recent-entries">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Journal</p>
            <CardTitle className="text-lg font-semibold">Recent entries</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground"
            onClick={onViewJournal}
            data-testid="recent-entries-view-journal"
          >
            View journal <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {mockEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onView={() => onViewEntry?.(entry.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
