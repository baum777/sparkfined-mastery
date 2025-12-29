import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChartTopBar } from "@/components/chart/ChartTopBar";
import { ChartSidebar } from "@/components/chart/ChartSidebar";
import { ChartRightPanel } from "@/components/chart/ChartRightPanel";
import { ChartBottomTabs } from "@/components/chart/ChartBottomTabs";
import { ChartReplayControls } from "@/components/chart/ChartReplayControls";
import { ChartToolbar } from "@/components/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChartCanvas } from "@/features/chart/ChartCanvas";
import { useRecentlyViewed, useWatchlist } from "@/features/watchlist";

export default function Chart() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Recently Viewed & Watchlist
  const { items: recentlyViewed, addToken } = useRecentlyViewed();
  const { items: watchlistItems } = useWatchlist();
  const [tokenListMode, setTokenListMode] = useState<'watchlist' | 'recent'>('watchlist');

  // State
  const [selectedMarket, setSelectedMarket] = useState(() => {
    return searchParams.get("symbol") || "BTC/USD";
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Tools & Indicators State
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(["sma", "volume"]);

  // Track viewed tokens
  useEffect(() => {
    if (selectedMarket) {
      const name = selectedMarket.split('/')[0];
      addToken(selectedMarket, name);
    }
  }, [selectedMarket, addToken]);

  const handleIndicatorToggle = useCallback((indicatorId: string) => {
    setActiveIndicators((prev) => {
      if (prev.includes(indicatorId)) {
        return prev.filter((id) => id !== indicatorId);
      }
      return [...prev, indicatorId];
    });
  }, []);

  // Update market when URL param changes
  useEffect(() => {
    const symbol = searchParams.get("symbol");
    if (symbol && symbol !== selectedMarket) {
      setSelectedMarket(symbol);
    }
  }, [searchParams]);

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
        tokenListMode={tokenListMode}
        onTokenListModeChange={setTokenListMode}
        watchlistItems={watchlistItems}
        recentlyViewed={recentlyViewed}
        onTokenSelect={(symbol) => setSelectedMarket(symbol)}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar - Markets */}
        {!isMobile && (
          <ChartSidebar
            selectedMarket={selectedMarket}
            onMarketSelect={(symbol) => {
              setSelectedMarket(symbol);
              // Optionally update URL
              // setSearchParams({ symbol }); // Maybe keep it simple for now
            }}
            className="w-52 shrink-0"
          />
        )}

        {/* Chart Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-border p-2">
            <ChartToolbar />
          </div>

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
            className="flex flex-1 relative overflow-hidden bg-background"
            data-testid="chart-canvas-container"
          >
             <ChartCanvas 
                symbol={selectedMarket} 
                timeframe={selectedTimeframe}
                activeIndicators={activeIndicators}
                drawingTool={selectedTool}
             />
          </div>

          {/* Bottom Tabs */}
          <ChartBottomTabs symbol={selectedMarket} />
        </div>

        {/* Desktop Right Panel - Tools & Indicators */}
        {!isMobile && (
          <ChartRightPanel 
            className="w-56 shrink-0" 
            selectedTool={selectedTool}
            onDrawingToolSelect={setSelectedTool}
            activeIndicators={activeIndicators}
            onIndicatorToggle={handleIndicatorToggle}
          />
        )}
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
