import { BookOpen } from "lucide-react";

export default function Journal() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" data-testid="page-journal">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Journal</h1>
      <p className="max-w-md text-muted-foreground">
        Log and review your trades with notes and custom tags.
      </p>
    </div>
  );
}
