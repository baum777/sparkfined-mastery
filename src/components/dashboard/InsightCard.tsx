import { Lightbulb, TrendingUp, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InsightCardProps {
  isReady?: boolean;
  winRate?: number;
  avgPnl?: number;
  bestPerformer?: { symbol: string; pnl: number } | null;
}

export function InsightCard({ 
  isReady = false, 
  winRate = 0, 
  avgPnl = 0, 
  bestPerformer = null 
}: InsightCardProps) {
  if (!isReady) {
    return (
      <Card data-testid="dashboard-insight" className="border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Stats
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Preview
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-md bg-muted/50">
              <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-lg font-semibold text-muted-foreground">—</p>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Avg PnL</p>
              <p className="text-lg font-semibold text-muted-foreground">—</p>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/50">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Best</p>
              <p className="text-lg font-semibold text-muted-foreground">—</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Log 5+ trades to unlock stats
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPnl = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(value).toFixed(0)}`;
  };

  return (
    <Card data-testid="dashboard-insight">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-md bg-muted/50">
            <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-lg font-semibold">{winRate.toFixed(0)}%</p>
          </div>
          <div className="text-center p-2 rounded-md bg-muted/50">
            <TrendingUp className={`h-4 w-4 mx-auto mb-1 ${avgPnl >= 0 ? "text-green-500" : "text-red-500"}`} />
            <p className="text-xs text-muted-foreground">Avg PnL</p>
            <p className={`text-lg font-semibold ${avgPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatPnl(avgPnl)}
            </p>
          </div>
          <div className="text-center p-2 rounded-md bg-muted/50">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <p className="text-xs text-muted-foreground">Best</p>
            <p className="text-lg font-semibold truncate">
              {bestPerformer ? bestPerformer.symbol : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
