import { GraduationCap } from "lucide-react";

export default function Learn() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" data-testid="page-learn">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <GraduationCap className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Learn</h1>
      <p className="max-w-md text-muted-foreground">
        Your path from degen to mastery starts here.
      </p>
    </div>
  );
}
