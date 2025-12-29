import { Sparkles, FileText, MessageSquare, Lightbulb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChartBottomPanelsProps {
  symbol: string;
  className?: string;
}

export function ChartBottomPanels({ symbol, className }: ChartBottomPanelsProps) {
  return (
    <div 
      className={cn("grid grid-cols-1 md:grid-cols-2 border-t border-border bg-card", className)} 
      data-testid="chart-bottom-panels"
    >
      {/* Grok Pulse Panel */}
      <div className="border-b md:border-b-0 md:border-r border-border">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-muted/30">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Grok Pulse</span>
        </div>
        <ScrollArea className="h-32">
          <div className="flex flex-col gap-3 p-4" data-testid="chart-pulse-content">
            <div className="flex items-start gap-3 rounded-md bg-secondary/30 p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Market Sentiment</p>
                <p className="mt-1 text-muted-foreground">
                  {symbol} showing bullish momentum on the 4H timeframe. Key resistance at previous swing high.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md bg-secondary/30 p-3">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Pattern Alert</p>
                <p className="mt-1 text-muted-foreground">
                  Potential bull flag forming. Watch for breakout above consolidation.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Journal Notes Panel */}
      <div>
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-muted/30">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Journal Notes</span>
        </div>
        <ScrollArea className="h-32">
          <div className="flex flex-col gap-3 p-4" data-testid="chart-notes-content">
            <div className="rounded-md bg-secondary/30 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Today, 10:30 AM</span>
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-primary">Long</span>
              </div>
              <p className="mt-2 text-foreground">
                Entry at support level. Targeting previous high with 2:1 RR.
              </p>
            </div>
            <div className="rounded-md bg-secondary/30 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Yesterday, 2:15 PM</span>
                <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-destructive">Short</span>
              </div>
              <p className="mt-2 text-foreground">
                Rejected at resistance. Clean setup with good volume confirmation.
              </p>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Notes from your journal entries for {symbol}
            </p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
