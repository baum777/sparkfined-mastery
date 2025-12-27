import { TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type BiasDirection = "bullish" | "bearish" | "neutral";

interface DailyBiasCardProps {
  symbol?: string;
  bias?: BiasDirection;
  confidence?: number;
  bulletPoints?: string[];
  lastChecked?: Date;
  onRefresh?: () => void;
  onViewAnalysis?: () => void;
  onOpenChart?: () => void;
  isRefreshing?: boolean;
}

export function DailyBiasCard({ 
  symbol = "SOL",
  bias = "bullish", 
  confidence = 0,
  bulletPoints = [
    "Market structure shows higher lows with strong momentum on intraday timeframes.",
    "Watching for pullbacks to re-enter long positions with tight risk management."
  ],
  lastChecked = new Date(),
  onRefresh,
  onViewAnalysis,
  onOpenChart,
  isRefreshing = false,
}: DailyBiasCardProps) {
  const biasConfig = {
    bullish: {
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      label: "LONG HIGH",
    },
    bearish: {
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "SHORT HIGH",
    },
    neutral: {
      icon: Minus,
      color: "text-muted-foreground",
      bg: "bg-muted",
      label: "NEUTRAL",
    },
  };

  const config = biasConfig[bias];

  return (
    <Card className="w-full" data-testid="dashboard-daily-bias">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {symbol} Daily Bias
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            disabled={isRefreshing}
            data-testid="daily-bias-refresh"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bias Label */}
        <Badge 
          variant="outline" 
          className={cn("text-xs font-medium", config.color)}
        >
          {config.label}
        </Badge>

        {/* AI Summary Bullet Points */}
        <ul className="space-y-2">
          {bulletPoints.map((point, index) => (
            <li 
              key={index} 
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onViewAnalysis}
            data-testid="daily-bias-view-analysis"
          >
            View full analysis
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1"
            onClick={onOpenChart}
            data-testid="daily-bias-open-chart"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Open chart
          </Button>
        </div>

        {/* Last Checked Timestamp */}
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Last checked {format(lastChecked, "MM.dd HH:mm")}
        </p>
      </CardContent>
    </Card>
  );
}
