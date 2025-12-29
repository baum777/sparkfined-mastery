import { useState } from "react";
import { 
  Minus, Square, ArrowUpRight,
  ChevronDown,
  Hash,
  Brush,
  Ruler,
  TrendingUp,
  Activity,
  Target,
  ArrowUpCircle,
  ArrowDownCircle,
  Spline
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const DRAWING_TOOLS = [
  { 
    category: "Lines",
    items: [
      { id: "line", label: "Trend Line", icon: Minus },
      { id: "ray", label: "Ray", icon: ArrowUpRight },
    ]
  },
  {
    category: "Channels",
    items: [
      { id: "parallel_channel", label: "Parallel Channel", icon: Hash },
      { id: "disjoint_channel", label: "Disjoint Channel", icon: Hash },
    ]
  },
  {
    category: "Shapes",
    items: [
      { id: "rectangle", label: "Rectangle", icon: Square },
      { id: "brush", label: "Brush", icon: Brush },
    ]
  },
  {
    category: "Analysis",
    items: [
      { id: "fib", label: "Fib Retracement", icon: Activity },
      { id: "elliot_wave", label: "Elliot Wave (1-5)", icon: Spline },
      { id: "ruler", label: "Ruler", icon: Ruler },
    ]
  },
  {
    category: "Risk/Reward",
    items: [
      { id: "risk_reward_long", label: "Long Position", icon: ArrowUpCircle },
      { id: "risk_reward_short", label: "Short Position", icon: ArrowDownCircle },
    ]
  }
];

const INDICATORS = [
  { id: "rsi", label: "RSI (Relative Strength Index)", category: "Momentum" },
  { id: "bb", label: "Bollinger Bands", category: "Volatility" },
  { id: "macd", label: "MACD", category: "Momentum" },
  { id: "ema", label: "EMA (Exponential Moving Average)", category: "Trend" },
  { id: "sma", label: "SMA (Simple Moving Average)", category: "Trend" },
  { id: "volume", label: "Volume", category: "Volume" },
];

interface ChartRightPanelProps {
  className?: string;
  selectedTool: string | null;
  onDrawingToolSelect: (toolId: string | null) => void;
  activeIndicators: string[];
  onIndicatorToggle: (indicatorId: string) => void;
}

export function ChartRightPanel({ 
  className, 
  selectedTool,
  onDrawingToolSelect, 
  activeIndicators,
  onIndicatorToggle 
}: ChartRightPanelProps) {

  // Flatten tools for finding label
  const allTools = DRAWING_TOOLS.flatMap(c => c.items);
  const selectedToolLabel = allTools.find((t) => t.id === selectedTool)?.label || "Select Tool";

  return (
    <aside
      className={cn(
        "flex flex-col gap-4 border-l border-border bg-card p-4",
        className
      )}
      data-testid="chart-right-panel"
    >
      {/* Drawing Tools Card */}
      <Card data-testid="chart-drawing-tools-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Brush className="h-4 w-4" />
            Drawing Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                data-testid="chart-drawing-tools-dropdown"
              >
                <span className="truncate">{selectedToolLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-popover z-50 max-h-[400px] overflow-y-auto" 
              align="start"
            >
              <DropdownMenuItem
                onClick={() => onDrawingToolSelect(null)}
                className="cursor-pointer text-muted-foreground font-medium"
              >
                <Minus className="mr-2 h-4 w-4 opacity-0" />
                Stop Drawing
              </DropdownMenuItem>
              
              {DRAWING_TOOLS.map((category, idx) => (
                <div key={category.category}>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{category.category}</DropdownMenuLabel>
                  {category.items.map((tool) => (
                    <DropdownMenuItem
                      key={tool.id}
                      onClick={() => onDrawingToolSelect(tool.id)}
                      className={cn(
                        "cursor-pointer pl-6",
                        selectedTool === tool.id && "bg-accent"
                      )}
                      data-testid={`chart-tool-${tool.id}`}
                    >
                      <tool.icon className="mr-2 h-4 w-4" />
                      {tool.label}
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Indicators Card */}
      <Card data-testid="chart-indicators-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" />
            Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
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
                  onClick={() => onIndicatorToggle(indicator.id)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between",
                    activeIndicators.includes(indicator.id) && "bg-accent"
                  )}
                  data-testid={`chart-indicator-${indicator.id}`}
                >
                  <div className="flex flex-col">
                    <span>{indicator.label}</span>
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
            <div className="mt-3 flex flex-wrap gap-1">
              {activeIndicators.map((id) => {
                const indicator = INDICATORS.find((i) => i.id === id);
                return (
                  <Button
                    key={id}
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onIndicatorToggle(id)}
                  >
                    {indicator?.id.toUpperCase()}
                    <span className="ml-1 opacity-50">×</span>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
