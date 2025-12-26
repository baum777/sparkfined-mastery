import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { primaryNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden"
      data-testid="mobile-bottom-nav"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {primaryNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`${item.testId}-mobile`}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
