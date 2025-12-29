import { useState } from "react";
import { 
  Pencil, TrendingUp, LineChart, 
  Minus, Circle, Square, Triangle, Type, ArrowUpRight,
  ChevronDown, ChevronLeft, ChevronRight, HelpCircle, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useCallback } from "react";

const DRAWING_TOOLS = [
  { id: "line", label: "Trend Line", icon: Minus, description: "Verbindet zwei Punkte um Trend-Richtung anzuzeigen. Nutze für Support/Resistance Linien." },
  { id: "hline", label: "Horizontal Line", icon: Minus, description: "Horizontale Linie für statische Preisniveaus wie historische Highs/Lows." },
  { id: "vline", label: "Vertical Line", icon: Minus, description: "Vertikale Linie um wichtige Zeitpunkte wie News-Events zu markieren." },
  { id: "ray", label: "Ray", icon: ArrowUpRight, description: "Strahl der von einem Punkt aus unendlich verlängert wird." },
  { id: "rectangle", label: "Rectangle", icon: Square, description: "Rechteck für Zonen-Markierung wie Konsolidierung oder Supply/Demand." },
  { id: "circle", label: "Circle", icon: Circle, description: "Kreis für Fokus auf bestimmte Chart-Bereiche." },
  { id: "triangle", label: "Triangle", icon: Triangle, description: "Dreieck für Pattern-Markierung wie symmetrische/aufsteigende Dreiecke." },
  { id: "fib", label: "Fibonacci Retracement", icon: TrendingUp, description: "Fibonacci-Level für mögliche Retracement-Zonen bei Pullbacks." },
  { id: "text", label: "Text", icon: Type, description: "Textnotizen direkt im Chart für Reminder und Annotationen." },
];

const INDICATORS = [
  { id: "sma", label: "SMA", fullLabel: "Simple Moving Average", category: "Trend", description: "Gleitender Durchschnitt für Trend-Erkennung und dynamische S/R Levels." },
  { id: "ema", label: "EMA", fullLabel: "Exponential Moving Average", category: "Trend", description: "Schneller reagierender Durchschnitt, gewichtet neuere Preise stärker." },
  { id: "bb", label: "BB", fullLabel: "Bollinger Bands", category: "Volatility", description: "Volatilitäts-Bänder für Überkauft/Überverkauft und Mean-Reversion." },
  { id: "rsi", label: "RSI", fullLabel: "Relative Strength Index", category: "Momentum", description: "Momentum-Oszillator 0-100. Über 70 überkauft, unter 30 überverkauft." },
  { id: "macd", label: "MACD", fullLabel: "Moving Average Convergence Divergence", category: "Momentum", description: "Trend-Following Momentum. Signal bei Crossover der Linien." },
  { id: "stoch", label: "Stoch", fullLabel: "Stochastic", category: "Momentum", description: "Vergleicht Schlusskurs mit Range. Gut für Divergenzen." },
  { id: "atr", label: "ATR", fullLabel: "Average True Range", category: "Volatility", description: "Misst Volatilität. Nutze für Stop-Loss Platzierung." },
  { id: "volume", label: "Vol", fullLabel: "Volume", category: "Volume", description: "Handelsvolumen. Bestätigt Preis-Bewegungen und Breakouts." },
  { id: "vwap", label: "VWAP", fullLabel: "Volume Weighted Average Price", category: "Volume", description: "Durchschnittspreis gewichtet nach Volumen. Institutioneller Benchmark." },
];

const CHART_PATTERNS = [
  { id: "headshoulders", title: "Head & Shoulders", scenario: "Bearish reversal nach Uptrend. Neckline Break bestätigt.", emoji: "📉" },
  { id: "doubletop", title: "Double Top", scenario: "Zwei Hochs auf gleichem Level. Bearish wenn Support bricht.", emoji: "🔻" },
  { id: "doublebottom", title: "Double Bottom", scenario: "Zwei Tiefs auf gleichem Level. Bullish bei Resistance Break.", emoji: "🔺" },
  { id: "bullflag", title: "Bull Flag", scenario: "Konsolidierung nach starkem Anstieg. Continuation Pattern.", emoji: "🚀" },
  { id: "bearflag", title: "Bear Flag", scenario: "Konsolidierung nach starkem Abfall. Continuation Pattern.", emoji: "🐻" },
  { id: "ascending", title: "Ascending Triangle", scenario: "Flat Top, steigende Lows. Bullish Breakout wahrscheinlich.", emoji: "📈" },
  { id: "descending", title: "Descending Triangle", scenario: "Flat Bottom, fallende Highs. Bearish Breakdown wahrscheinlich.", emoji: "📉" },
  { id: "wedge", title: "Rising Wedge", scenario: "Konvergierende Highs und Lows nach oben. Bearish Reversal.", emoji: "⚠️" },
];

interface ChartRightPanelProps {
  className?: string;
  onDrawingToolSelect?: (toolId: string) => void;
  onIndicatorSelect?: (indicatorId: string) => void;
}

export function ChartRightPanel({ 
  className, 
  onDrawingToolSelect, 
  onIndicatorSelect 
}: ChartRightPanelProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(["sma", "volume"]);
  const [howToOpen, setHowToOpen] = useState(false);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    onDrawingToolSelect?.(toolId);
  };

  const handleIndicatorToggle = (indicatorId: string) => {
    setActiveIndicators((prev) => {
      if (prev.includes(indicatorId)) {
        return prev.filter((id) => id !== indicatorId);
      }
      return [...prev, indicatorId];
    });
    onIndicatorSelect?.(indicatorId);
  };

  const selectedToolLabel = DRAWING_TOOLS.find((t) => t.id === selectedTool)?.label || "Select Tool";

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPatternIndex((prev) => (prev + 1) % CHART_PATTERNS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const goToPrevPattern = useCallback(() => {
    setCurrentPatternIndex((prev) => (prev - 1 + CHART_PATTERNS.length) % CHART_PATTERNS.length);
  }, []);

  const goToNextPattern = useCallback(() => {
    setCurrentPatternIndex((prev) => (prev + 1) % CHART_PATTERNS.length);
  }, []);

  const currentPattern = CHART_PATTERNS[currentPatternIndex];

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col gap-3 border-l border-border bg-card p-3",
        className
      )}
      data-testid="chart-right-panel"
    >
      {/* Drawing Tools Card */}
      <Card data-testid="chart-drawing-tools-card">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Pencil className="h-3.5 w-3.5" />
            Drawing Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between text-sm"
                data-testid="chart-drawing-tools-dropdown"
              >
                <span className="truncate">{selectedToolLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-popover z-50" 
              align="start"
            >
              {DRAWING_TOOLS.map((tool) => (
                <DropdownMenuItem
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={cn(
                    "cursor-pointer",
                    selectedTool === tool.id && "bg-accent"
                  )}
                  data-testid={`chart-tool-${tool.id}`}
                >
                  <tool.icon className="mr-2 h-4 w-4" />
                  {tool.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Indicators Card */}
      <Card data-testid="chart-indicators-card">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <LineChart className="h-3.5 w-3.5" />
            Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between text-sm"
                data-testid="chart-indicators-dropdown"
              >
                <span className="truncate">
                  {activeIndicators.length > 0 
                    ? `${activeIndicators.length} active` 
                    : "Add Indicator"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 bg-popover z-50 max-h-64 overflow-y-auto" 
              align="start"
            >
              {INDICATORS.map((indicator) => (
                <DropdownMenuItem
                  key={indicator.id}
                  onClick={() => handleIndicatorToggle(indicator.id)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between",
                    activeIndicators.includes(indicator.id) && "bg-accent"
                  )}
                  data-testid={`chart-indicator-${indicator.id}`}
                >
                  <div className="flex flex-col">
                    <span>{indicator.fullLabel}</span>
                    <span className="text-xs text-muted-foreground">
                      {indicator.category}
                    </span>
                  </div>
                  {activeIndicators.includes(indicator.id) && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Active indicators list */}
          {activeIndicators.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {activeIndicators.map((id) => {
                const indicator = INDICATORS.find((i) => i.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {indicator?.label}
                  </span>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Chart CTA */}
      <Button
        variant="outline"
        onClick={() => setHowToOpen(true)}
        className="w-full justify-center gap-2 text-sm"
        data-testid="chart-how-to-cta"
      >
        <HelpCircle className="h-4 w-4" />
        How to Chart
      </Button>

      {/* Pattern Carousel */}
      <Card className="flex-1" data-testid="chart-pattern-carousel">
        <CardContent className="flex h-full flex-col justify-between p-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToPrevPattern}
              data-testid="chart-pattern-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {CHART_PATTERNS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === currentPatternIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToNextPattern}
              data-testid="chart-pattern-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-3 text-center">
            <div className="text-3xl mb-2">{currentPattern.emoji}</div>
            <p className="text-sm font-medium text-foreground">{currentPattern.title}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {currentPattern.scenario}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Chart Dialog */}
      <Dialog open={howToOpen} onOpenChange={setHowToOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" data-testid="chart-how-to-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              How to Chart
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="tools" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tools">Drawing Tools</TabsTrigger>
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="mt-4 space-y-3">
              {DRAWING_TOOLS.map((tool) => (
                <div key={tool.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <tool.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{tool.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="indicators" className="mt-4 space-y-3">
              {INDICATORS.map((indicator) => (
                <div key={indicator.id} className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{indicator.fullLabel}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {indicator.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </aside>
  );
}