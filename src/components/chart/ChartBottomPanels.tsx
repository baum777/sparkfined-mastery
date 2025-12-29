import { useState } from "react";
import { Sparkles, FileText, MessageSquare, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartBottomPanelsProps {
  symbol: string;
  className?: string;
}

const PULSE_ITEMS = [
  {
    icon: Lightbulb,
    title: "Market Sentiment",
    content: "Bullish momentum on the 4H timeframe. Key resistance at previous swing high.",
    iconColor: "text-warning"
  },
  {
    icon: MessageSquare,
    title: "Pattern Alert",
    content: "Potential bull flag forming. Watch for breakout above consolidation.",
    iconColor: "text-primary"
  },
  {
    icon: Sparkles,
    title: "Volume Analysis",
    content: "Volume increasing on green candles, suggests accumulation phase.",
    iconColor: "text-success"
  }
];

const NOTE_ITEMS = [
  {
    time: "Today, 10:30 AM",
    direction: "Long",
    directionColor: "bg-primary/20 text-primary",
    content: "Entry at support level. Targeting previous high with 2:1 RR."
  },
  {
    time: "Yesterday, 2:15 PM",
    direction: "Short",
    directionColor: "bg-destructive/20 text-destructive",
    content: "Rejected at resistance. Clean setup with good volume confirmation."
  },
  {
    time: "2 days ago",
    direction: "Long",
    directionColor: "bg-primary/20 text-primary",
    content: "Breakout trade above consolidation. Scaled out at 1.5R."
  }
];

export function ChartBottomPanels({ symbol, className }: ChartBottomPanelsProps) {
  const [pulseIndex, setPulseIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);

  const currentPulse = PULSE_ITEMS[pulseIndex];
  const currentNote = NOTE_ITEMS[noteIndex];
  const PulseIcon = currentPulse.icon;

  const goToPrevPulse = () => setPulseIndex((prev) => (prev - 1 + PULSE_ITEMS.length) % PULSE_ITEMS.length);
  const goToNextPulse = () => setPulseIndex((prev) => (prev + 1) % PULSE_ITEMS.length);
  const goToPrevNote = () => setNoteIndex((prev) => (prev - 1 + NOTE_ITEMS.length) % NOTE_ITEMS.length);
  const goToNextNote = () => setNoteIndex((prev) => (prev + 1) % NOTE_ITEMS.length);

  return (
    <div 
      className={cn("grid grid-cols-1 md:grid-cols-2 border-t border-border bg-card", className)} 
      data-testid="chart-bottom-panels"
    >
      {/* Grok Pulse Panel */}
      <div className="border-b md:border-b-0 md:border-r border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Grok Pulse</span>
          </div>
          <div className="flex items-center gap-1">
            {PULSE_ITEMS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === pulseIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center h-28" data-testid="chart-pulse-content">
          <button
            onClick={goToPrevPulse}
            className="flex h-full w-10 shrink-0 items-center justify-center hover:bg-muted/50 transition-colors"
            data-testid="chart-pulse-prev"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="flex flex-1 items-start gap-3 p-3">
            <PulseIcon className={cn("mt-0.5 h-4 w-4 shrink-0", currentPulse.iconColor)} />
            <div className="text-sm min-w-0">
              <p className="font-medium text-foreground">{currentPulse.title}</p>
              <p className="mt-1 text-muted-foreground line-clamp-2">
                {currentPulse.content}
              </p>
            </div>
          </div>
          
          <button
            onClick={goToNextPulse}
            className="flex h-full w-10 shrink-0 items-center justify-center hover:bg-muted/50 transition-colors"
            data-testid="chart-pulse-next"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Journal Notes Panel */}
      <div>
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Journal Notes</span>
          </div>
          <div className="flex items-center gap-1">
            {NOTE_ITEMS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === noteIndex ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center h-28" data-testid="chart-notes-content">
          <button
            onClick={goToPrevNote}
            className="flex h-full w-10 shrink-0 items-center justify-center hover:bg-muted/50 transition-colors"
            data-testid="chart-notes-prev"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <div className="flex-1 p-3">
            <div className="rounded-md bg-secondary/30 p-3 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{currentNote.time}</span>
                <span className={cn("rounded px-1.5 py-0.5", currentNote.directionColor)}>
                  {currentNote.direction}
                </span>
              </div>
              <p className="mt-2 text-foreground line-clamp-2">
                {currentNote.content}
              </p>
            </div>
          </div>
          
          <button
            onClick={goToNextNote}
            className="flex h-full w-10 shrink-0 items-center justify-center hover:bg-muted/50 transition-colors"
            data-testid="chart-notes-next"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}