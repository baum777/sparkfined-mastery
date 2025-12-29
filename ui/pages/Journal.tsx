import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { JournalView } from "@/features/journal/JournalView";
import { useJournalStore, setJournalWallet } from "@/features/journal/useJournalStore";
import { useJournalSync } from "@/hooks/useJournalSync";

export default function Journal() {
  const { pendingCount, archivedCount, confirmedCount } = useJournalStore();
  const { publicKey } = useWallet();
  
  // Manage device secret for sync authentication
  const [secret] = useState(() => {
    try {
        let s = localStorage.getItem('sparkfined_device_secret');
        if (!s) {
            s = crypto.randomUUID();
            localStorage.setItem('sparkfined_device_secret', s);
        }
        return s;
    } catch {
        return "fallback-secret";
    }
  });

  // Update store context when wallet changes
  useEffect(() => {
    setJournalWallet(publicKey ? publicKey.toBase58() : null);
  }, [publicKey]);

  // Enable background sync
  useJournalSync(publicKey ? publicKey.toBase58() : null, secret);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-journal">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Journal</h1>
        <p className="text-sm text-muted-foreground">
          Auto-capture trades, add notes, and build self-awareness.
        </p>
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
