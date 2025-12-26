import {
  DailySnapshotCard,
  QuickActionsCard,
  InsightCard,
  AlertsSnapshotCard,
  MasteryProgressCard,
  DashboardEmptyState,
} from "@/components/dashboard";

export default function Dashboard() {
  // Placeholder: in real app, derive from journal entries
  const hasEntries = false;
  const tradeCount = 0;
  const triggeredAlerts = 0;

  const insightsReady = tradeCount >= 5;
  const masteryStep = Math.min(tradeCount, 5);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" data-testid="page-dashboard">
      {/* Mastery Progress - quiet, top placement */}
      <MasteryProgressCard currentStep={masteryStep} totalSteps={5} />

      {!hasEntries ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <DailySnapshotCard />
          <QuickActionsCard hasEntries={hasEntries} />
          <InsightCard isReady={insightsReady} />
          <AlertsSnapshotCard triggeredCount={triggeredAlerts} />
        </div>
      )}

      {/* Show widgets in preview mode even when empty */}
      {!hasEntries && (
        <div className="grid gap-4 md:grid-cols-2 opacity-60">
          <DailySnapshotCard />
          <QuickActionsCard hasEntries={hasEntries} />
          <InsightCard isReady={false} />
          <AlertsSnapshotCard triggeredCount={triggeredAlerts} />
        </div>
      )}
    </div>
  );
}
