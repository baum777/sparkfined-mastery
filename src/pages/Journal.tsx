import { useState } from "react";
import { JournalView } from "@/features/journal/JournalView";
import { useJournalStore } from "@/features/journal/useJournalStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { PenLine } from "lucide-react";

export default function Journal() {
  const { pendingCount, archivedCount, confirmedCount } = useJournalStore();
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  const handleEntrySubmit = (data: any) => {
    console.log("Manual journal entry submitted:", data);
    setIsManualEntryOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-journal">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">
            Auto-capture trades, add notes, and build self-awareness.
          </p>
        </div>
        <Button 
          onClick={() => setIsManualEntryOpen(true)}
          className="gap-2"
          data-testid="btn-manual-journal-entry"
        >
          <PenLine className="h-4 w-4" />
          Journal Entry
        </Button>
      </div>

      {/* Journal View with Segmented Control */}
      <JournalView
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
        archivedCount={archivedCount}
      />

      {/* Manual Journal Entry Modal */}
      <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
          </DialogHeader>
          <JournalEntryForm onSubmit={handleEntrySubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
