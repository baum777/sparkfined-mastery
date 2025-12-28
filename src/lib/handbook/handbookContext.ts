import { useSyncExternalStore } from "react";
import type { HandbookContext } from "@/lib/handbook/types";

// Keys for localStorage
const WALLET_KEY = "sparkfined_connected_wallet";
const WATCHLIST_KEY = "sparkfined_watchlist";
const DEMO_OVERRIDES_KEY = "sparkfined_handbook_demo_overrides";

// Demo mode state
let demoModeEnabled = false;
let demoOverrides: Partial<HandbookContext> = {};

// Subscribe to storage changes
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  
  // Also listen to storage events for cross-tab sync
  const handleStorage = () => listener();
  window.addEventListener("storage", handleStorage);
  
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getRealContext(): HandbookContext {
  try {
    // Check wallet connection
    const walletData = localStorage.getItem(WALLET_KEY);
    const walletConnected = !!walletData;
    
    // Check for monitored wallet (same as connected for now)
    const hasMonitoredWallet = walletConnected;
    
    // Check holdings (simplified - just check if wallet connected)
    const hasHoldings = walletConnected;
    
    // Check journal entries
    const pendingEntries = localStorage.getItem("sparkfined_pending_entries");
    const confirmedEntries = localStorage.getItem("sparkfined_confirmed_entries");
    const archivedEntries = localStorage.getItem("sparkfined_archived_entries");
    
    const pendingCount = pendingEntries ? JSON.parse(pendingEntries).length : 0;
    const confirmedCount = confirmedEntries ? JSON.parse(confirmedEntries).length : 0;
    const archivedCount = archivedEntries ? JSON.parse(archivedEntries).length : 0;
    const hasEntries = pendingCount + confirmedCount + archivedCount > 0;
    
    // Check watchlist
    const watchlistData = localStorage.getItem(WATCHLIST_KEY);
    const hasWatchlist = watchlistData ? JSON.parse(watchlistData).length > 0 : false;
    
    // Check alerts
    const alertsData = localStorage.getItem("sparkfined_alerts");
    const hasAlerts = alertsData ? JSON.parse(alertsData).length > 0 : false;
    
    // Check online status
    const isOffline = !navigator.onLine;
    
    // Check for selected token (from URL or state)
    const urlParams = new URLSearchParams(window.location.search);
    const hasSelectedToken = !!urlParams.get("token") || !!urlParams.get("symbol");
    
    return {
      walletConnected,
      hasMonitoredWallet,
      hasHoldings,
      hasEntries,
      hasWatchlist,
      hasAlerts,
      isOffline,
      hasSelectedToken,
    };
  } catch {
    // Return safe defaults on error
    return {
      walletConnected: false,
      hasMonitoredWallet: false,
      hasHoldings: false,
      hasEntries: false,
      hasWatchlist: false,
      hasAlerts: false,
      isOffline: false,
      hasSelectedToken: false,
    };
  }
}

function getSnapshot(): HandbookContext {
  const realContext = getRealContext();
  
  // If demo mode is enabled, merge overrides
  if (demoModeEnabled) {
    return { ...realContext, ...demoOverrides };
  }
  
  return realContext;
}

// Trigger re-check when app state changes
export function notifyContextChange() {
  listeners.forEach((listener) => listener());
}

// Demo mode controls
export function isDemoModeEnabled(): boolean {
  return demoModeEnabled;
}

export function enableDemoMode() {
  demoModeEnabled = true;
  // Load saved overrides
  try {
    const saved = localStorage.getItem(DEMO_OVERRIDES_KEY);
    if (saved) {
      demoOverrides = JSON.parse(saved);
    }
  } catch {
    demoOverrides = {};
  }
  notifyContextChange();
}

export function disableDemoMode() {
  demoModeEnabled = false;
  notifyContextChange();
}

export function setDemoOverride<K extends keyof HandbookContext>(key: K, value: HandbookContext[K]) {
  demoOverrides[key] = value;
  // Persist to localStorage
  try {
    localStorage.setItem(DEMO_OVERRIDES_KEY, JSON.stringify(demoOverrides));
  } catch {
    // Ignore storage errors
  }
  notifyContextChange();
}

export function getDemoOverrides(): Partial<HandbookContext> {
  return { ...demoOverrides };
}

export function resetDemoOverrides() {
  demoOverrides = {};
  try {
    localStorage.removeItem(DEMO_OVERRIDES_KEY);
  } catch {
    // Ignore
  }
  notifyContextChange();
}

// Hook to get current handbook context
export function useHandbookContext(): HandbookContext {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Hook for demo mode state
export function useDemoMode(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => demoModeEnabled,
    () => demoModeEnabled
  );
}

// Helper to check a single gate
export function checkGate(gate: string, context: HandbookContext): boolean {
  switch (gate) {
    case "walletConnected":
      return context.walletConnected;
    case "hasMonitoredWallet":
      return context.hasMonitoredWallet;
    case "hasHoldings":
      return context.hasHoldings;
    case "hasEntries":
      return context.hasEntries;
    case "hasWatchlist":
      return context.hasWatchlist;
    case "hasAlerts":
      return context.hasAlerts;
    case "isOnline":
      return !context.isOffline;
    case "isOffline":
      return context.isOffline;
    case "hasSelectedToken":
      return context.hasSelectedToken;
    default:
      // Unknown gates default to false (not satisfied)
      return false;
  }
}
