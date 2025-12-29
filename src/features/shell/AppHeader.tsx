import { useState } from "react";
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
import { Flame, MoreHorizontal, HelpCircle, ClipboardPaste, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { HandbookTrigger } from "@/components/handbook";
import { useHandbookPanel } from "@/hooks/useHandbookPanel";
import { toast } from "sonner";

export function AppHeader() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { open: openHandbook } = useHandbookPanel();

  const handleSearch = (ca: string) => {
    const trimmed = ca.trim();
    if (!trimmed) {
      toast.error("Keine CA eingegeben");
      return;
    }
    // Navigate to chart with the CA
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

      {/* Centered search field */}
      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input
              type="text"
              placeholder="CA eingeben..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchValue)}
              className="pl-9 pr-3 bg-surface border-border-sf-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-1 focus:ring-brand/30 focus:shadow-[0_0_12px_hsl(var(--brand)/0.25)] transition-shadow duration-200"
              data-testid="ca-search-input"
            />
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