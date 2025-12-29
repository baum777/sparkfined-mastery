import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { secondaryNavItems } from "@/config/navigation";
import { Flame, MoreHorizontal, HelpCircle, ClipboardPaste, Search, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HandbookTrigger } from "@/components/handbook";
import { useHandbookPanel } from "@/hooks/useHandbookPanel";
import { toast } from "sonner";

const HISTORY_KEY = "ca-search-history";
const MAX_HISTORY = 5;

function getSearchHistory(): string[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addToHistory(ca: string): string[] {
  const history = getSearchHistory().filter((item) => item !== ca);
  const updated = [ca, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function AppHeader() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { open: openHandbook } = useHandbookPanel();

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        historyRef.current &&
        !historyRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (ca: string) => {
    const trimmed = ca.trim();
    if (!trimmed) {
      toast.error("Keine CA eingegeben");
      return;
    }
    const updated = addToHistory(trimmed);
    setHistory(updated);
    setShowHistory(false);
    navigate(`/chart?token=${encodeURIComponent(trimmed)}`);
  };

  const handlePasteAndSearch = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (trimmed) {
        setSearchValue(trimmed);
        handleSearch(trimmed);
      } else {
        toast.error("Zwischenablage ist leer");
      }
    } catch {
      toast.error("Kein Zugriff auf Zwischenablage");
    }
  };

  const handleHistoryClick = (ca: string) => {
    setSearchValue(ca);
    handleSearch(ca);
  };

  const removeFromHistory = (ca: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item !== ca);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  return (
    <header className="nav-header flex items-center justify-between gap-4 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger 
          className="hidden md:flex text-text-secondary hover:text-text-primary hover:bg-surface-hover" 
          data-testid="sidebar-trigger" 
        />
        
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-glow-brand">
            <Flame className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-semibold text-text-primary tracking-tight">
            Sparkfined
          </span>
        </div>
      </div>

      {/* Centered search field with history dropdown */}
      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none z-10" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="CA eingeben..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => history.length > 0 && setShowHistory(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchValue)}
              className="pl-9 pr-3 bg-surface border-border-sf-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-1 focus:ring-brand/30 focus:shadow-[0_0_12px_hsl(var(--brand)/0.25)] transition-shadow duration-200"
              data-testid="ca-search-input"
            />
            {/* History dropdown */}
            {showHistory && history.length > 0 && (
              <div
                ref={historyRef}
                className="absolute top-full left-0 right-0 mt-1 bg-elevated border border-border-sf-subtle rounded-lg shadow-lg z-50 overflow-hidden"
                data-testid="ca-search-history"
              >
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-tertiary border-b border-border-sf-subtle">
                  Letzte Suchen
                </div>
                {history.map((ca) => (
                  <button
                    key={ca}
                    onClick={() => handleHistoryClick(ca)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors group"
                    data-testid="ca-history-item"
                  >
                    <Clock className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                    <span className="truncate flex-1 text-left font-mono text-xs">{ca}</span>
                    <button
                      onClick={(e) => removeFromHistory(ca, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-danger transition-opacity"
                      title="Entfernen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePasteAndSearch}
            className="shrink-0 border-border-sf-subtle text-text-secondary hover:text-brand hover:border-brand hover:bg-surface-hover"
            title="CA einfügen & suchen"
            data-testid="paste-search-btn"
          >
            <ClipboardPaste className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Handbook trigger (desktop) */}
        <div className="hidden md:flex">
          <HandbookTrigger />
        </div>

        {/* Mobile: Advanced menu trigger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              data-testid="mobile-advanced-trigger"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </Button>
          </SheetTrigger>
        <SheetContent 
          side="right" 
          className="w-64 bg-elevated border-l border-border-sf-subtle"
        >
          <SheetHeader>
            <SheetTitle className="text-text-primary text-[10px] uppercase tracking-wider font-medium">
              Advanced
            </SheetTitle>
          </SheetHeader>
          <nav className="mt-4 flex flex-col gap-1" role="navigation" aria-label="Advanced navigation">
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-testid={`${item.testId}-mobile`}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
                    isActive
                      ? "bg-surface-hover text-brand border-l-2 border-brand shadow-glow"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
            {/* Mobile handbook trigger */}
            <Separator className="my-3 bg-border-sf-subtle" />
            <button
              onClick={() => {
                setSheetOpen(false);
                openHandbook();
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-150 w-full"
              data-testid="handbook-trigger-mobile"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Handbook</span>
              <kbd className="ml-auto text-[10px] text-text-tertiary bg-surface px-1.5 py-0.5 rounded">?</kbd>
            </button>
          </nav>
        </SheetContent>
      </Sheet>
      </div>
    </header>
  );
}