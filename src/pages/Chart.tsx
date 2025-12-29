import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { ChartTopBar } from "@/components/chart/ChartTopBar";
import { ChartSidebar } from "@/components/chart/ChartSidebar";
import { ChartBottomPanels } from "@/components/chart/ChartBottomPanels";
import { ChartReplayControls } from "@/components/chart/ChartReplayControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/features/watchlist/useWatchlist";
import { useRecentlyViewed } from "@/features/watchlist/useRecentlyViewed";
import { useLivePrices } from "@/features/watchlist/useLivePrices";
import type { WatchlistItem, RecentlyViewedToken } from "@/features/watchlist/types";

export default function Chart() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { items: watchlistItems } = useWatchlist();
  const { items: recentTokens, addToken } = useRecentlyViewed();
  const addTokenRef = useRef(addToken);
  addTokenRef.current = addToken;

  // State
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tokenSource, setTokenSource] = useState<"watchlist" | "recent">("watchlist");
  const [showTokenBanner, setShowTokenBanner] = useState(() => 
    localStorage.getItem("chartShowTokenBanner") !== "false"
  );

  // Collect all unique symbols for live price fetching
  const allSymbols = useMemo(() => {
    const symbols = new Set<string>();
    watchlistItems.forEach(item => symbols.add(item.symbol));
    recentTokens.forEach(token => symbols.add(token.symbol));
    symbols.add(selectedMarket.split("/")[0]);
    return Array.from(symbols);
  }, [watchlistItems, recentTokens, selectedMarket]);

  // Fetch live prices from APIs
  const { getPrice, isLoading: pricesLoading, refresh } = useLivePrices(allSymbols);

  // Merge live prices with watchlist/recent tokens
  const watchlistWithLivePrices: WatchlistItem[] = useMemo(() => {
    return watchlistItems.map(item => {
      const livePrice = getPrice(item.symbol);
      if (livePrice) {
        return {
          ...item,
          price: livePrice.price,
          change24h: livePrice.change24h,
        };
      }
      return item;
    });
  }, [watchlistItems, getPrice]);

  const recentWithLivePrices: RecentlyViewedToken[] = useMemo(() => {
    return recentTokens.map(token => {
      const livePrice = getPrice(token.symbol);
      if (livePrice) {
        return {
          ...token,
          price: livePrice.price,
          change24h: livePrice.change24h,
        };
      }
      return token;
    });
  }, [recentTokens, getPrice]);

  // Track recently viewed tokens - use ref to avoid infinite loop
  useEffect(() => {
    const symbol = selectedMarket.split("/")[0];
    addTokenRef.current(symbol, symbol);
  }, [selectedMarket]);

  // Sync with localStorage changes (e.g. from Settings)
  useEffect(() => {
    const handleStorage = () => {
      setShowTokenBanner(localStorage.getItem("chartShowTokenBanner") !== "false");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  
  // Replay state
  const isReplayMode = searchParams.get("replay") === "true";
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState("1");
  const replayDuration = 600; // 10 minutes demo

  const handleToggleReplay = useCallback(() => {
    if (isReplayMode) {
      searchParams.delete("replay");
      setSearchParams(searchParams);
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      searchParams.set("replay", "true");
      setSearchParams(searchParams);
    }
  }, [isReplayMode, searchParams, setSearchParams]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const handleStepBack = useCallback(() => {
    setCurrentTime((prev) => Math.max(0, prev - 10));
  }, []);

  const handleStepForward = useCallback(() => {
    setCurrentTime((prev) => Math.min(replayDuration, prev + 10));
  }, []);

  const handleTokenSelect = useCallback((symbol: string) => {
    setSelectedMarket(`${symbol}/USD`);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isReplayMode) return;
      
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleStepBack();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleStepForward();
      }
    },
    [isReplayMode, handlePlayPause, handleStepBack, handleStepForward]
  );

  return (
    <div
      className="flex h-full flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="page-chart"
    >
      {/* Top Bar */}
      <ChartTopBar
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        isReplayMode={isReplayMode}
        onToggleReplay={handleToggleReplay}
        onMenuClick={() => setSidebarOpen(true)}
        showMenuButton={isMobile}
        tokenSource={tokenSource}
        onTokenSourceChange={setTokenSource}
        showTokenBanner={showTokenBanner}
        watchlistItems={watchlistWithLivePrices}
        recentTokens={recentWithLivePrices}
        selectedMarket={selectedMarket}
        onTokenSelect={handleTokenSelect}
        pricesLoading={pricesLoading}
        onRefreshPrices={refresh}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden p-3">
        {/* Chart Area - Full Width */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background">
          {/* Replay Controls (when active) */}
          {isReplayMode && (
            <div className="border-b border-border p-3">
              <ChartReplayControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={replayDuration}
                speed={speed}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                onSpeedChange={setSpeed}
                onReset={handleReset}
                onStepBack={handleStepBack}
                onStepForward={handleStepForward}
              />
            </div>
          )}

          {/* Canvas */}
          <div
            className="flex flex-1 items-center justify-center bg-muted/20"
            data-testid="chart-canvas-container"
          >
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  {selectedMarket} • {selectedTimeframe}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isReplayMode
                    ? "Replay mode active. Use controls to navigate historical data."
                    : "Chart canvas ready. Connect a charting provider to view live data."}
                </p>
                {!isReplayMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleReplay}
                    className="mt-2"
                  >
                    Try Replay Mode
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Panels - Side by Side */}
          <ChartBottomPanels symbol={selectedMarket} />
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle>Markets</SheetTitle>
          </SheetHeader>
          <ChartSidebar
            selectedMarket={selectedMarket}
            onMarketSelect={(symbol) => {
              setSelectedMarket(symbol);
              setSidebarOpen(false);
            }}
            className="border-0"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}