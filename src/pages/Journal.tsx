import { JournalEntryForm, RecentEntriesSection } from "@/components/journal";
import { useTradesStore } from "@/features/journal";
import { toast } from "@/hooks/use-toast";

export default function Journal() {
  const { trades, addTrade } = useTradesStore();

  const handleEntrySubmit = (data: any) => {
    addTrade({
      asset: "Entry",
      direction: "long",
      entryPrice: "0",
      entryDate: new Date().toISOString().split("T")[0],
      notes: data.reasoning,
      tags: data.tags.join(", "),
    });
    toast({
      title: "Entry logged",
      description: "Your journal entry has been saved successfully.",
    });
  };

  // Transform trades to recent entries format
  const recentEntries = trades.slice(-10).reverse().map((trade) => ({
    id: trade.id,
    asset: trade.asset,
    direction: trade.direction,
    createdAt: trade.createdAt,
    pnl: trade.pnl,
    tags: trade.tags?.split(",").map((t) => t.trim()).filter(Boolean),
  }));

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-journal">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Journal</h1>
        <p className="text-sm text-muted-foreground">
          Document your trades, track emotions, and build self-awareness.
        </p>
      </div>

      {/* Main Entry Form */}
      <JournalEntryForm onSubmit={handleEntrySubmit} />

      {/* Recent Entries */}
      <RecentEntriesSection entries={recentEntries} />
    </div>
  );
}
