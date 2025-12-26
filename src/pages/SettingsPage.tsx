import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" data-testid="page-settings">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <Settings className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="max-w-md text-muted-foreground">
        Manage your preferences and export your data.
      </p>
    </div>
  );
}
