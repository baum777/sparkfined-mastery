import { Sparkles } from "lucide-react";

export default function Oracle() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold" data-testid="oracle-heading">
        Oracle
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        AI-powered insights and market analysis to guide your trading journey.
      </p>
    </div>
  );
}
