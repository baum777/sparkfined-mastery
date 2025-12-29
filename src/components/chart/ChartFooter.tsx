import { useState } from "react";
import { Library, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const PATTERN_LIBRARY = [
  {
    category: "Reversal Patterns",
    patterns: [
      { id: "headshoulders", name: "Head & Shoulders", description: "Bearish reversal pattern bestehend aus drei Peaks. Der mittlere Peak (Head) ist höher als die beiden äußeren (Shoulders). Neckline Break bestätigt das Pattern.", signal: "Bearish", emoji: "📉" },
      { id: "invheadshoulders", name: "Inverse Head & Shoulders", description: "Bullish reversal pattern. Spiegelbild des normalen H&S. Drei Tiefs wobei das mittlere tiefer ist.", signal: "Bullish", emoji: "📈" },
      { id: "doubletop", name: "Double Top", description: "Zwei Hochs auf ähnlichem Preisniveau mit einem Tal dazwischen. Bearish wenn das Tal (Neckline) durchbrochen wird.", signal: "Bearish", emoji: "🔻" },
      { id: "doublebottom", name: "Double Bottom", description: "Zwei Tiefs auf ähnlichem Preisniveau. Bullish wenn die Resistance zwischen den Tiefs durchbrochen wird.", signal: "Bullish", emoji: "🔺" },
      { id: "tripletop", name: "Triple Top", description: "Drei Hochs auf ähnlichem Level. Stärker als Double Top. Break unter Support bestätigt.", signal: "Bearish", emoji: "📉" },
      { id: "triplebottom", name: "Triple Bottom", description: "Drei Tiefs auf ähnlichem Level. Stärker als Double Bottom. Break über Resistance bestätigt.", signal: "Bullish", emoji: "📈" },
    ]
  },
  {
    category: "Continuation Patterns",
    patterns: [
      { id: "bullflag", name: "Bull Flag", description: "Kurze Konsolidierung nach starkem Anstieg. Die Flagge neigt sich leicht nach unten. Breakout in Trend-Richtung erwartet.", signal: "Bullish", emoji: "🚀" },
      { id: "bearflag", name: "Bear Flag", description: "Kurze Konsolidierung nach starkem Abfall. Die Flagge neigt sich leicht nach oben. Breakdown in Trend-Richtung erwartet.", signal: "Bearish", emoji: "🐻" },
      { id: "bullpennant", name: "Bull Pennant", description: "Symmetrisches Dreieck nach starkem Anstieg. Konvergierende Trendlinien. Breakout nach oben erwartet.", signal: "Bullish", emoji: "🎯" },
      { id: "bearpennant", name: "Bear Pennant", description: "Symmetrisches Dreieck nach starkem Abfall. Konvergierende Trendlinien. Breakdown nach unten erwartet.", signal: "Bearish", emoji: "🎯" },
      { id: "rectangle", name: "Rectangle", description: "Horizontale Konsolidierung zwischen Support und Resistance. Breakout in beide Richtungen möglich.", signal: "Neutral", emoji: "📊" },
    ]
  },
  {
    category: "Triangle Patterns",
    patterns: [
      { id: "ascending", name: "Ascending Triangle", description: "Flat Resistance mit steigenden Lows. Buyers werden aggressiver. Bullish Breakout über Resistance wahrscheinlich.", signal: "Bullish", emoji: "📈" },
      { id: "descending", name: "Descending Triangle", description: "Flat Support mit fallenden Highs. Sellers werden aggressiver. Bearish Breakdown unter Support wahrscheinlich.", signal: "Bearish", emoji: "📉" },
      { id: "symmetric", name: "Symmetric Triangle", description: "Konvergierende Highs und Lows. Unentschlossenheit im Markt. Breakout in beide Richtungen möglich, oft in vorherige Trend-Richtung.", signal: "Neutral", emoji: "⚖️" },
    ]
  },
  {
    category: "Wedge Patterns",
    patterns: [
      { id: "risingwedge", name: "Rising Wedge", description: "Konvergierende Highs und Lows die nach oben zeigen. Momentum schwächt sich ab. Bearish Reversal oder Continuation.", signal: "Bearish", emoji: "⚠️" },
      { id: "fallingwedge", name: "Falling Wedge", description: "Konvergierende Highs und Lows die nach unten zeigen. Selling Pressure nimmt ab. Bullish Reversal oder Continuation.", signal: "Bullish", emoji: "💚" },
    ]
  },
];

interface ChartFooterProps {
  className?: string;
}

export function ChartFooter({ className }: ChartFooterProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  return (
    <>
      <div 
        className={cn("flex items-center justify-center border-t border-border bg-card py-2 px-4", className)}
        data-testid="chart-footer"
      >
        <Button
          variant="outline"
          onClick={() => setLibraryOpen(true)}
          className="gap-2"
          data-testid="chart-pattern-library-btn"
        >
          <Library className="h-4 w-4" />
          Chart Pattern Bibliothek
        </Button>
      </div>

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0" data-testid="chart-pattern-library-dialog">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              Chart Pattern Bibliothek
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[calc(85vh-80px)]">
            <div className="p-6 space-y-6">
              {PATTERN_LIBRARY.map((category) => (
                <div key={category.category}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.patterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className={cn(
                          "rounded-lg border border-border bg-muted/30 transition-all cursor-pointer",
                          expandedPattern === pattern.id && "bg-muted/50"
                        )}
                        onClick={() => setExpandedPattern(
                          expandedPattern === pattern.id ? null : pattern.id
                        )}
                      >
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{pattern.emoji}</span>
                            <span className="font-medium">{pattern.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded",
                              pattern.signal === "Bullish" && "bg-success/20 text-success",
                              pattern.signal === "Bearish" && "bg-destructive/20 text-destructive",
                              pattern.signal === "Neutral" && "bg-muted text-muted-foreground"
                            )}>
                              {pattern.signal}
                            </span>
                            <ChevronRight className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              expandedPattern === pattern.id && "rotate-90"
                            )} />
                          </div>
                        </div>
                        
                        {expandedPattern === pattern.id && (
                          <div className="px-3 pb-3 pt-0">
                            <p className="text-sm text-muted-foreground leading-relaxed pl-9">
                              {pattern.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}