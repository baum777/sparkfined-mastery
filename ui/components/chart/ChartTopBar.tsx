import { Menu, Download, Settings2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { WatchlistItem, RecentlyViewedToken } from "@/features/watchlist";

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
  className?: string;
  // Token toggle
  tokenListMode?: 'watchlist' | 'recent';
  onTokenListModeChange?: (mode: 'watchlist' | 'recent') => void;
  watchlistItems?: WatchlistItem[];
  recentlyViewed?: RecentlyViewedToken[];
  onTokenSelect?: (symbol: string) => void;
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
  className,
  tokenListMode = 'watchlist',
  onTokenListModeChange,
  watchlistItems = [],
  recentlyViewed = [],
  onTokenSelect,
}: ChartTopBarProps) {
  const displayTokens = tokenListMode === 'watchlist' 
    ? watchlistItems.map(i => ({ symbol: i.symbol, name: i.name }))
    : recentlyViewed.map(i => ({ symbol: i.symbol, name: i.name }));

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2",
        className
      )}
      data-testid="chart-topbar"
    >
      {/* Left: Menu (mobile) + Token Toggle */}
      <div className="flex items-center gap-3">
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
        
        {/* Token List Mode Toggle */}
        <div className="flex items-center gap-2">
          <Label htmlFor="token-mode" className="text-xs text-muted-foreground">
            {tokenListMode === 'watchlist' ? 'Watchlist' : 'Recent'}
          </Label>
          <Switch
            id="token-mode"
            checked={tokenListMode === 'recent'}
            onCheckedChange={(checked) => onTokenListModeChange?.(checked ? 'recent' : 'watchlist')}
            data-testid="chart-token-mode-toggle"
          />
        </div>

        {/* Token Chips */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-[300px]">
          {displayTokens.slice(0, 5).map((token) => (
            <TooltipProvider key={token.symbol}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTokenSelect?.(token.symbol)}
                    className="h-6 px-2 text-xs whitespace-nowrap"
                    data-testid={`chart-token-${token.symbol}`}
                  >
                    {token.symbol}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{token.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Center: Timeframes */}
      <div className="flex items-center gap-1 overflow-x-auto" data-testid="chart-timeframes">
        <TooltipProvider>
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
                <p>Timeframe: {tf}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
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
              <p>{isReplayMode ? 'Exit Replay Mode' : 'Enter Replay Mode'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          className="h-8 w-8"
          data-testid="chart-export-btn"
        >
          <Download className="h-4 w-4" />
        </Button>
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
  );
}
