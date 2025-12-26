import { SidebarTrigger } from "@/components/ui/sidebar";
import { Flame } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <SidebarTrigger className="hidden md:flex" data-testid="sidebar-trigger" />
      
      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Flame className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">Sparkfined</span>
      </div>
    </header>
  );
}
