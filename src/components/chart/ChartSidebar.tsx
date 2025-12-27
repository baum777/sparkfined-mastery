import { useState } from "react";
import { TrendingUp, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MARKETS = [
  { symbol: "BTC/USD", name: "Bitcoin", change: 2.4 },
  { symbol: "ETH/USD", name: "Ethereum", change: -1.2 },
  { symbol: "SOL/USD", name: "Solana", change: 5.1 },
  { symbol: "AVAX/USD", name: "Avalanche", change: -0.8 },
];

const SESSIONS = [
  { id: "asia", label: "Asia", time: "00:00 - 08:00", emoji: "🌏", active: false },
  { id: "london", label: "London", time: "08:00 - 16:00", emoji: "🇪🇺", active: true },
  { id: "newyork", label: "New York", time: "13:00 - 21:00", emoji: "🇺🇸", active: true },
];

interface ChartSidebarProps {
  selectedMarket: string;
  onMarketSelect: (symbol: string) => void;
  className?: string;
}

export function ChartSidebar({ selectedMarket, onMarketSelect, className }: ChartSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-6 border-r border-border bg-card p-4",
        className
      )}
      data-testid="chart-sidebar"
    >
      {/* Markets Section */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          Markets
        </h3>
        <div className="flex flex-col gap-1">
          {MARKETS.map((market) => (
            <button
              key={market.symbol}
              onClick={() => onMarketSelect(market.symbol)}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selectedMarket === market.symbol && "bg-primary text-primary-foreground"
              )}
              data-testid={`chart-market-${market.symbol.replace("/", "-")}`}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{market.symbol}</span>
                <span className={cn(
                  "text-xs",
                  selectedMarket === market.symbol ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {market.name}
                </span>
              </div>
              <span className={cn(
                "text-xs font-medium",
                market.change >= 0 ? "text-success" : "text-destructive",
                selectedMarket === market.symbol && "text-primary-foreground"
              )}>
                {market.change >= 0 ? "+" : ""}{market.change}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Section */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Sessions
        </h3>
        <div className="flex flex-col gap-2">
          {SESSIONS.map((session) => (
            <div
              key={session.id}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                session.active ? "bg-secondary/50" : "opacity-50"
              )}
              data-testid={`chart-session-${session.id}`}
            >
              <span className="text-base">{session.emoji}</span>
              <div className="flex flex-col">
                <span className="font-medium">{session.label}</span>
                <span className="text-xs text-muted-foreground">{session.time}</span>
              </div>
              {session.active && (
                <span className="ml-auto h-2 w-2 rounded-full bg-success animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
