import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, TrendingDown, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTradesStore } from "@/features/journal/useTradesStore";
import { cn } from "@/lib/utils";

const MAX_TRADES = 5;

export function LastTradesCard() {
  const { trades } = useTradesStore();

  const recentTrades = useMemo(() => {
    return trades.slice(0, MAX_TRADES);
  }, [trades]);

  // Empty state
  if (recentTrades.length === 0) {
    return (
      <Card data-testid="dashboard-last-trades-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              No trades logged yet
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
              data-testid="dashboard-last-trades-cta"
            >
              <Link to="/journal" className="gap-2">
                <PenLine className="h-4 w-4" />
                Log your first trade
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="dashboard-last-trades-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Trades
          </CardTitle>
          <Link
            to="/journal"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {recentTrades.map((trade) => {
          const pnlValue = trade.pnl ? parseFloat(trade.pnl) : null;
          const isPositive = pnlValue !== null && pnlValue > 0;
          const isNegative = pnlValue !== null && pnlValue < 0;

          return (
            <Link
              key={trade.id}
              to="/journal"
              className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              data-testid="dashboard-last-trades-item"
            >
              <div className="flex items-center gap-3">
                {trade.direction === "long" ? (
                  <TrendingUp className="h-4 w-4 text-chart-2" aria-label="Long" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" aria-label="Short" />
                )}
                <div>
                  <span className="text-sm font-medium">{trade.asset}</span>
                  <span className="text-xs text-muted-foreground ml-2 capitalize">
                    {trade.direction}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                {pnlValue !== null ? (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isPositive && "text-chart-2",
                      isNegative && "text-destructive",
                      !isPositive && !isNegative && "text-muted-foreground"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {trade.pnl}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
                <span className="text-xs text-muted-foreground min-w-[60px]">
                  {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
