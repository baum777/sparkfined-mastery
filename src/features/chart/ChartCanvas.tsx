import { useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ChartCanvas() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate data reload
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>BTC/USD</span>
          <span>•</span>
          <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
          data-testid="chart-refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div 
        className="flex flex-col items-center justify-center gap-6 p-12 rounded-lg bg-muted/30 border border-border min-h-[300px]"
        role="img"
        aria-label="Chart placeholder - connect to a charting provider to view live data"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            Chart canvas ready. Connect a charting provider to view live data.
          </p>
          <Link 
            to="/replay"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Practice with Replay →
          </Link>
        </div>
      </div>
    </div>
  );
}
