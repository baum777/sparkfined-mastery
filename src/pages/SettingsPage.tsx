import { Settings } from "lucide-react";
import {
  SettingsSection,
  ThemeToggle,
  DataExportImport,
  FactoryReset,
  SetupCompleteness,
} from "@/components/settings";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6" data-testid="page-settings">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your preferences and data
          </p>
        </div>
      </div>

      {/* Setup completeness cue */}
      <SetupCompleteness />

      {/* Theme - Priority 1 */}
      <SettingsSection
        title="Appearance"
        description="Customize how the app looks"
        priority
      >
        <ThemeToggle />
      </SettingsSection>

      {/* Export/Import - Priority 2 */}
      <SettingsSection
        title="Backup & Restore"
        description="Export your data or restore from a backup"
        priority
      >
        <DataExportImport />
      </SettingsSection>

      {/* Preferences - Priority 3 (stub) */}
      <SettingsSection
        title="Preferences"
        description="General app settings"
        priority
      >
        <p className="text-sm text-muted-foreground italic">
          More preferences coming soon — notifications, default views, and display options.
        </p>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection
        title="Danger zone"
        description="Irreversible actions"
        className="border-destructive/30"
      >
        <FactoryReset />
      </SettingsSection>
    </div>
  );
}
