import { useState } from "react";
import { JournalView } from "@/features/journal/JournalView";
import { useJournalStore } from "@/features/journal/useJournalStore";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export default function Journal() {
  const { pendingCount, archivedCount, confirmedCount } = useJournalStore();
  const [entrySheetOpen, setEntrySheetOpen] = useState(false);

  const handleEntrySubmit = (data: unknown) => {
    console.log("Manual entry submitted:", data);
    setEntrySheetOpen(false);
  };

  return (
    <div className="flex flex-col gap-6" data-testid="page-journal">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-muted-foreground">
            Auto-capture trades, add notes, and build self-awareness.
          </p>
        </div>
        
        {/* Entry Button */}
        <Sheet open={entrySheetOpen} onOpenChange={setEntrySheetOpen}>
          <SheetTrigger asChild>
            <Button 
              className="gap-2 shrink-0" 
              data-testid="manual-entry-btn"
            >
              <Plus className="h-4 w-4" />
              Entry
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto bg-background"
          >
            <SheetHeader className="mb-4">
              <SheetTitle>Manual Entry</SheetTitle>
            </SheetHeader>
            <JournalEntryForm onSubmit={handleEntrySubmit} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Journal View with Segmented Control */}
      <JournalView
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
        archivedCount={archivedCount}
      />
    </div>
  );
}
