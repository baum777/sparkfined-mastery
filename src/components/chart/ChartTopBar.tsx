import { Menu, Download, Settings2, Play, List, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  className?: string;
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
  className,
}: ChartTopBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2",
        className
      )}
      data-testid="chart-topbar"
    >
      {/* Left: Token Source Toggle */}
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
        
        {showTokenBanner && (
          <ToggleGroup
            type="single"
            value={tokenSource}
            onValueChange={(value) => value && onTokenSourceChange?.(value as "watchlist" | "recent")}
            className="h-8"
            data-testid="chart-token-source-toggle"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="watchlist" className="h-8 px-2.5 text-xs gap-1.5">
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Watchlist</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Tokens from your watchlist</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="recent" className="h-8 px-2.5 text-xs gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Recent</span>
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Recently viewed tokens</TooltipContent>
            </Tooltip>
          </ToggleGroup>
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
  );
}