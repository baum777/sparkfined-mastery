import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

type ProgressStep = "state" | "thesis" | "review";

interface JournalProgressProps {
  currentStep?: ProgressStep;
  completedSteps?: ProgressStep[];
}

const STEPS: { id: ProgressStep; label: string }[] = [
  { id: "state", label: "State" },
  { id: "thesis", label: "Thesis" },
  { id: "review", label: "Review" },
];

export function JournalProgress({
  currentStep = "state",
  completedSteps = [],
}: JournalProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div
      className="flex items-center gap-1 text-xs text-muted-foreground"
      data-testid="journal-progress"
      role="navigation"
      aria-label="Trade entry progress"
    >
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center gap-1">
            {index > 0 && <span className="mx-1 text-border">→</span>}
            <Badge
              variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
              className={`gap-1 px-2 py-0.5 text-xs font-normal ${
                isCurrent
                  ? "bg-primary/10 text-primary"
                  : isCompleted
                  ? "bg-muted text-muted-foreground"
                  : "text-muted-foreground/60"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {step.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
