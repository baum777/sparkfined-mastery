import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" data-testid="page-dashboard">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="max-w-md text-muted-foreground">
        Your daily trading snapshot and quick actions will appear here.
      </p>
    </div>
  );
}
