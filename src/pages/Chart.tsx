import { LineChart } from "lucide-react";

export default function Chart() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" data-testid="page-chart">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <LineChart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Chart</h1>
      <p className="max-w-md text-muted-foreground">
        Analyze and annotate your trading charts.
      </p>
    </div>
  );
}
