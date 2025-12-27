import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BiasDirection = "bullish" | "bearish" | "neutral";

interface DailyBiasCardProps {
  bias?: BiasDirection;
  confidence?: number; // 0-100
  reason?: string;
}

export function DailyBiasCard({ 
  bias = "neutral", 
  confidence = 0,
  reason 
}: DailyBiasCardProps) {
  const biasConfig = {
    bullish: {
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      label: "Bullish",
    },
    bearish: {
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Bearish",
    },
    neutral: {
      icon: Minus,
      color: "text-muted-foreground",
      bg: "bg-muted",
      label: "Neutral",
    },
  };

  const config = biasConfig[bias];
  const BiasIcon = config.icon;

  return (
    <Card data-testid="dashboard-daily-bias">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daily Bias
          </CardTitle>
          {confidence > 0 && (
            <Badge variant="secondary" className="text-xs">
              {confidence}% confident
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.bg)}>
            <BiasIcon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <p className={cn("text-lg font-semibold", config.color)}>
              {config.label}
            </p>
            {reason && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {reason}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
