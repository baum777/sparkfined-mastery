import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type ActionHandler = (action: string) => void;

export function useHandbookActionDispatcher(): ActionHandler {
  const navigate = useNavigate();

  return (action: string) => {
    if (!action) return;

    // Parse action type
    const [type, ...rest] = action.split(":");
    const target = rest.join(":");

    switch (type) {
      case "nav":
        // Navigate to route
        if (target) {
          navigate(target);
        }
        break;

      case "focus":
        // Focus an element by ID
        const focusEl = document.getElementById(target);
        if (focusEl) {
          focusEl.focus();
          focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          toast({
            title: "Target not found",
            description: `Could not find element: ${target}`,
            variant: "destructive",
          });
        }
        break;

      case "scroll":
        // Scroll to anchor
        const scrollEl = document.getElementById(target) || 
                         document.querySelector(`[data-anchor="${target}"]`);
        if (scrollEl) {
          scrollEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          toast({
            title: "Target not found",
            description: `Could not find anchor: ${target}`,
            variant: "destructive",
          });
        }
        break;

      case "open":
        // Modal/sheet/panel opening - MVP placeholder
        toast({
          title: "Action not wired yet",
          description: `open:${target}`,
        });
        break;

      case "do":
        // Custom actions - MVP placeholder
        toast({
          title: "Action not wired yet",
          description: `do:${target}`,
        });
        break;

      default:
        // Unknown action type
        toast({
          title: "Unknown action",
          description: action,
        });
    }
  };
}
