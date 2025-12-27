import { Wallet, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ConnectedWallet {
  address: string;
  label: string;
  addedAt: string;
}

export function ConnectedWalletsSettings() {
  const [wallets, setWallets] = useState<ConnectedWallet[]>(() => {
    try {
      const stored = localStorage.getItem("connectedWallets");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("connectedWallets", JSON.stringify(wallets));
  }, [wallets]);

  const handleConnect = () => {
    // Mock wallet connection
    const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    const newWallet: ConnectedWallet = {
      address: mockAddress,
      label: `Wallet ${wallets.length + 1}`,
      addedAt: new Date().toISOString(),
    };
    setWallets([...wallets, newWallet]);
    toast.success("Wallet connected");
  };

  const handleRemove = (address: string) => {
    setWallets(wallets.filter(w => w.address !== address));
    toast.success("Wallet removed");
  };

  return (
    <div className="space-y-4" data-testid="settings-wallets">
      {wallets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No wallets connected</p>
          <Button size="sm" onClick={handleConnect} data-testid="wallet-connect-btn">
            <Plus className="mr-2 h-4 w-4" />
            Connect wallet
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {wallets.map((wallet) => (
              <li
                key={wallet.address}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                data-testid={`wallet-item-${wallet.address}`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{wallet.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{wallet.address}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(wallet.address)}
                  data-testid={`wallet-remove-${wallet.address}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" onClick={handleConnect} data-testid="wallet-add-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add another wallet
          </Button>
        </>
      )}
    </div>
  );
}
