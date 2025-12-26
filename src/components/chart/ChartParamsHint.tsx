import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const HINT_KEY = "chart-params-hint-dismissed";

export function ChartParamsHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(HINT_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(HINT_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm"
      role="status"
      aria-live="polite"
    >
      <Info className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
      <p className="flex-1 text-muted-foreground">
        <span className="font-medium text-foreground">Default symbol loaded.</span>{" "}
        Select a different asset from your watchlist to analyze.
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="h-7 w-7 p-0 shrink-0"
        aria-label="Dismiss hint"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
