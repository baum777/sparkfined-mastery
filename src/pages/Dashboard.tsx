import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  DashboardHeader,
  KpiStrip,
  DailyBiasCard,
  HoldingsCard,
  LastTradesCard,
  InsightCard,
  JournalSnapshotCard,
  AlertsSnapshotCard,
  MasteryProgressCard,
  DashboardEmptyState,
  DashboardFab,
} from "@/components/dashboard";
import { useTradesStore } from "@/features/journal/useTradesStore";
import { useAlerts } from "@/features/alerts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { hasTrades, trades } = useTradesStore();
  const { alerts } = useAlerts();
  
  const triggeredAlerts = alerts.filter(a => a.status === 'triggered').length;
  const masteryStep = Math.min(trades.length, 5);

  // Calculate KPIs
  const kpiData = useMemo(() => {
    if (trades.length === 0) {
      return { winRate: 0, avgRR: 0, streak: 0, bestTrade: "" };
    }

    const tradesWithPnL = trades.filter(t => t.pnl && parseFloat(t.pnl) !== 0);
    const wins = tradesWithPnL.filter(t => parseFloat(t.pnl!) > 0);
    const winRate = tradesWithPnL.length > 0 ? (wins.length / tradesWithPnL.length) * 100 : 0;
    
    const best = wins.sort((a, b) => parseFloat(b.pnl!) - parseFloat(a.pnl!))[0];
    const bestTrade = best ? `+${best.pnl}` : "";

    return {
      winRate,
      avgRR: 1.5, // Placeholder - would calculate from actual R:R data
      streak: 3, // Placeholder - would calculate from consecutive days
      bestTrade,
    };
  }, [trades]);

  // Journal snapshot data
  const journalData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekTrades = trades.filter(t => new Date(t.createdAt) >= weekAgo);
    const lastTrade = trades[0];
    
    return {
      totalEntries: trades.length,
      thisWeekEntries: thisWeekTrades.length,
      lastEntryDate: lastTrade 
        ? formatDistanceToNow(new Date(lastTrade.createdAt), { addSuffix: true })
        : undefined,
    };
  }, [trades]);

  const handleLogEntry = () => {
    navigate("/journal");
  };

  const handleCreateAlert = () => {
    navigate("/alerts");
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" data-testid="page-dashboard">
      {/* Header with meta counters and primary CTA */}
      <DashboardHeader 
        entriesCount={trades.length}
        alertsCount={alerts.length}
        onLogEntry={handleLogEntry}
      />

      {/* Mastery Progress - quiet, top placement */}
      <MasteryProgressCard currentStep={masteryStep} totalSteps={5} />

      {!hasTrades ? (
        <DashboardEmptyState />
      ) : (
        <>
          {/* KPI Strip - 5 KPIs */}
          <KpiStrip
            winRate={kpiData.winRate}
            avgRR={kpiData.avgRR}
            totalTrades={trades.length}
            streak={kpiData.streak}
            bestTrade={kpiData.bestTrade}
          />

          {/* Primary Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="dashboard-primary-cards">
            <DailyBiasCard />
            <HoldingsCard />
            <LastTradesCard />
          </div>

          {/* Secondary Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="dashboard-secondary-cards">
            <InsightCard isReady={trades.length >= 5} />
            <JournalSnapshotCard 
              totalEntries={journalData.totalEntries}
              thisWeekEntries={journalData.thisWeekEntries}
              lastEntryDate={journalData.lastEntryDate}
            />
            <AlertsSnapshotCard triggeredCount={triggeredAlerts} />
          </div>
        </>
      )}

      {/* Show preview widgets when empty */}
      {!hasTrades && (
        <div className="grid gap-4 md:grid-cols-2 opacity-60" data-testid="dashboard-preview-widgets">
          <DailyBiasCard />
          <HoldingsCard />
          <LastTradesCard />
          <InsightCard isReady={false} />
          <AlertsSnapshotCard triggeredCount={0} />
        </div>
      )}

      {/* Mobile FAB for quick actions */}
      <DashboardFab 
        onLogEntry={handleLogEntry}
        onCreateAlert={handleCreateAlert}
      />
    </div>
  );
}
