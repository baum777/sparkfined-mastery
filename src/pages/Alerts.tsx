import { Bell } from "lucide-react";

export default function Alerts() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" data-testid="page-alerts">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Alerts</h1>
      <p className="max-w-md text-muted-foreground">
        Set up trading rules and receive notifications.
      </p>
    </div>
  );
}
