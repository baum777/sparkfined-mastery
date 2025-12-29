import { BookOpen, Bell, PenLine, Search, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";

interface DashboardHeaderProps {
  entriesCount: number;
  alertsCount: number;
  onLogEntry: () => void;
}

export function DashboardHeader({ 
  entriesCount, 
  alertsCount,
  onLogEntry 
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    // Navigate to chart with symbol param
    // Note: The Chart page needs to handle this param
    navigate(`/chart?symbol=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePasteAndSearch = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        toast.error("Clipboard is empty");
        return;
      }

      const trimmed = text.trim();
      setSearchTerm(trimmed);

      // Validate if it looks like a Solana address (optional UX enhancement)
      let isAddress = false;
      try {
        new PublicKey(trimmed);
        isAddress = true;
      } catch {
        // Not a valid public key, but might be a ticker
      }

      const type = isAddress ? "Contract Address" : "Ticker";
      toast.info(`Searching ${type}: ${trimmed}`);
      
      navigate(`/chart?symbol=${encodeURIComponent(trimmed)}`);
    } catch (error) {
      console.error("Clipboard access failed:", error);
      toast.error("Could not access clipboard. Please check permissions.");
    }
  };

  return (
    <header 
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="dashboard-header"
    >
      <div>
        <h1 className="text-2xl font-bold" data-testid="dashboard-heading">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Your trading command center
        </p>
      </div>

      {/* Search Section */}
      <div className="flex w-full sm:max-w-md gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search ticker or address..."
            className="pl-9 bg-background/50 border-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            data-testid="dashboard-search-input"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePasteAndSearch}
          title="Paste from clipboard and search"
          data-testid="dashboard-paste-search-btn"
        >
          <Clipboard className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4 justify-between sm:justify-end">
        {/* Meta counters */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground" data-testid="dashboard-meta-counters">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span data-testid="dashboard-entries-count">{entriesCount}</span>
            <span className="hidden sm:inline">entries</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            <span data-testid="dashboard-alerts-count">{alertsCount}</span>
            <span className="hidden sm:inline">alerts</span>
          </span>
        </div>
        
        {/* Primary CTA */}
        <Button 
          onClick={onLogEntry}
          className="hidden sm:flex"
          data-testid="dashboard-log-entry-cta"
        >
          <PenLine className="mr-2 h-4 w-4" />
          Log Entry
        </Button>
      </div>
    </header>
  );
}
