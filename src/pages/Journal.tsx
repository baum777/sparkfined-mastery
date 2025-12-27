import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PendingList } from "@/components/journal/PendingList";
import { LogbookList } from "@/components/journal/LogbookList";
import { ConfirmedJournalList } from "@/components/journal/ConfirmedJournalList";
import { QuickLogModal } from "@/components/journal/QuickLogModal";
import { useJournalStore } from "@/features/journal/useJournalStore";
import type { AutoCapturedEntry, ArchivedEntry, EntryEnrichment } from "@/features/journal/types";

export default function Journal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("view") || "journal";
  
  const {
    pendingEntries,
    archivedEntries,
    confirmedEntries,
    pendingCount,
    archivedCount,
    confirmedCount,
    archiveEntry,
    confirmEntry,
    deletePendingEntry,
  } = useJournalStore();

  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AutoCapturedEntry | ArchivedEntry | null>(null);
  const [isFromArchive, setIsFromArchive] = useState(false);

  const handleTabChange = (value: string) => {
    setSearchParams({ view: value });
  };

  const handleConfirmFromPending = (id: string) => {
    const entry = pendingEntries.find((e) => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setIsFromArchive(false);
      setQuickLogOpen(true);
    }
  };

  const handleAddFromLogbook = (id: string) => {
    const entry = archivedEntries.find((e) => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setIsFromArchive(true);
      setQuickLogOpen(true);
    }
  };

  const handleSaveQuickLog = (id: string, enrichment: EntryEnrichment) => {
    confirmEntry(id, enrichment, isFromArchive);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-journal">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Journal</h1>
        <p className="text-sm text-muted-foreground">
          Auto-capture trades, add notes, and build self-awareness.
        </p>
      </div>

      {/* Segmented Control */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-surface-subtle border border-border-sf-subtle">
          <TabsTrigger
            value="journal"
            className="gap-2 data-[state=active]:bg-surface data-[state=active]:text-text-primary"
            data-testid="tab-journal"
          >
            Journal
            {confirmedCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 text-[10px] bg-brand/20 text-brand">
                {confirmedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="gap-2 data-[state=active]:bg-surface data-[state=active]:text-text-primary"
            data-testid="tab-pending"
          >
            Pending
            {pendingCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 text-[10px] bg-sentiment-neutral-bg text-sentiment-neutral">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="logbook"
            className="gap-2 data-[state=active]:bg-surface data-[state=active]:text-text-primary"
            data-testid="tab-logbook"
          >
            Logbook
            {archivedCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 text-[10px] bg-surface-hover text-text-tertiary">
                {archivedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="mt-4">
          <ConfirmedJournalList entries={confirmedEntries} />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <PendingList
            entries={pendingEntries}
            onConfirm={handleConfirmFromPending}
            onArchive={(id) => archiveEntry(id, "manual")}
            onDelete={deletePendingEntry}
          />
        </TabsContent>

        <TabsContent value="logbook" className="mt-4">
          <LogbookList
            entries={archivedEntries}
            onAddToJournal={handleAddFromLogbook}
            onViewDetails={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Log Modal */}
      <QuickLogModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        entry={selectedEntry}
        onSave={handleSaveQuickLog}
        onSkip={() => setQuickLogOpen(false)}
      />
    </div>
  );
}
