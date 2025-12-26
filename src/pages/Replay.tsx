import { Play } from "lucide-react";

export default function Replay() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Play className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold" data-testid="replay-heading">
        Chart Replay
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        Replay historical price action to study and practice trade setups.
      </p>
    </div>
  );
}
