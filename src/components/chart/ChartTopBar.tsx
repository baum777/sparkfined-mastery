import { Menu, Download, Settings2, Play, List, Clock, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import type { WatchlistItem, RecentlyViewedToken } from "@/features/watchlist/types";

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

interface ChartTopBarProps {
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  isReplayMode: boolean;
  onToggleReplay: () => void;
  onMenuClick?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  showMenuButton?: boolean;
  tokenSource?: "watchlist" | "recent";
  onTokenSourceChange?: (source: "watchlist" | "recent") => void;
  showTokenBanner?: boolean;
  watchlistItems?: WatchlistItem[];
  recentTokens?: RecentlyViewedToken[];
  selectedMarket?: string;
  onTokenSelect?: (symbol: string) => void;
  pricesLoading?: boolean;
  onRefreshPrices?: () => void;
  className?: string;
}

function formatPrice(price?: number): string {
  if (!price) return "—";
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatChange(change?: number): string {
  if (change === undefined || change === null) return "";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export function ChartTopBar({
  selectedTimeframe,
  onTimeframeChange,
  isReplayMode,
  onToggleReplay,
  onMenuClick,
  onExport,
  onSettings,
  showMenuButton = false,
  tokenSource = "watchlist",
  onTokenSourceChange,
  showTokenBanner = true,
  watchlistItems = [],
  recentTokens = [],
  selectedMarket,
  onTokenSelect,
  pricesLoading = false,
  onRefreshPrices,
  className,
}: ChartTopBarProps) {
  const displayTokens = tokenSource === "watchlist" 
    ? watchlistItems.slice(0, 5) 
    : recentTokens.slice(0, 5);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-border bg-card px-3 py-2",
        className
      )}
      data-testid="chart-topbar"
    >
      {/* Top Row: Token Banner */}
      {showTokenBanner && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <ToggleGroup
            type="single"
            value={tokenSource}
            onValueChange={(value) => value && onTokenSourceChange?.(value as "watchlist" | "recent")}
            className="h-7 shrink-0"
            data-testid="chart-token-source-toggle"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="watchlist" className="h-7 px-2 text-xs gap-1">
                  <List className="h-3 w-3" />
                  <span className="hidden sm:inline">WL</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Watchlist tokens</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="recent" className="h-7 px-2 text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="hidden sm:inline">Recent</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Recently viewed</TooltipContent>
            </Tooltip>
          </ToggleGroup>

          <div className="h-4 w-px bg-border shrink-0" />

          {/* Live Indicator & Refresh */}
          <div className="flex items-center gap-1 shrink-0">
            {pricesLoading ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span className="hidden sm:inline">Laden...</span>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onRefreshPrices}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="refresh-prices-btn"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    <span className="hidden sm:inline">Live</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Preise aktualisieren</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="h-4 w-px bg-border shrink-0" />

          {/* Token Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {displayTokens.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                {tokenSource === "watchlist" ? "No watchlist items" : "No recent tokens"}
              </span>
            ) : (
              displayTokens.map((token) => {
                const symbol = token.symbol;
                const price = token.price;
                const change = token.change24h;
                const isSelected = selectedMarket?.includes(symbol);
                const isPositive = (change ?? 0) >= 0;
                const hasLiveData = price !== undefined && price !== null;

                return (
                  <Badge
                    key={symbol}
                    variant={isSelected ? "default" : "secondary"}
                    className={cn(
                      "cursor-pointer whitespace-nowrap gap-1.5 px-2 py-0.5 text-xs font-medium transition-colors hover:bg-accent",
                      isSelected && "ring-1 ring-primary"
                    )}
                    onClick={() => onTokenSelect?.(symbol)}
                    data-testid={`token-chip-${symbol}`}
                  >
                    <span className="font-semibold">{symbol}</span>
                    {pricesLoading && !hasLiveData ? (
                      <span className="text-muted-foreground">
                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                      </span>
                    ) : hasLiveData ? (
                      <>
                        <span className="text-muted-foreground">{formatPrice(price)}</span>
                        {change !== undefined && (
                          <span
                            className={cn(
                              "flex items-center gap-0.5",
                              isPositive ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-2.5 w-2.5" />
                            ) : (
                              <TrendingDown className="h-2.5 w-2.5" />
                            )}
                            {formatChange(change)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bottom Row: Timeframes & Actions */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Menu Button (mobile) */}
        <div className="flex items-center gap-2">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-8 w-8"
              data-testid="chart-menu-btn"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center: Timeframes */}
        <div className="flex items-center gap-1 overflow-x-auto" data-testid="chart-timeframes">
          {TIMEFRAMES.map((tf) => (
            <Tooltip key={tf}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTimeframe === tf ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTimeframeChange(tf)}
                  className="h-7 px-2.5 text-xs"
                  data-testid={`chart-tf-${tf}`}
                >
                  {tf}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {tf === "1m" && "1 Minute"}
                {tf === "5m" && "5 Minutes"}
                {tf === "15m" && "15 Minutes"}
                {tf === "1H" && "1 Hour"}
                {tf === "4H" && "4 Hours"}
                {tf === "1D" && "1 Day"}
                {tf === "1W" && "1 Week"}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isReplayMode ? "default" : "outline"}
                size="sm"
                onClick={onToggleReplay}
                className={cn("h-7 gap-1.5 text-xs", isReplayMode && "bg-primary")}
                data-testid="chart-replay-toggle"
              >
                <Play className="h-3.5 w-3.5" />
                Replay
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isReplayMode ? "Exit replay mode" : "Enter replay mode to practice"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                className="h-8 w-8"
                data-testid="chart-export-btn"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export chart</TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="h-8 w-8 sm:hidden"
            data-testid="chart-settings-btn"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}