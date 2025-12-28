import { useSyncExternalStore, useCallback } from "react";
import { notifyContextChange } from "@/lib/handbook/handbookContext";
import type {
  AutoCapturedEntry,
  ArchivedEntry,
  ConfirmedEntry,
  EntryEnrichment,
  ArchiveReason,
  PendingStatus,
  ExtendedDataSettings,
} from "./types";

const PENDING_KEY = "sparkfined_pending_entries";
const ARCHIVED_KEY = "sparkfined_archived_entries";
const CONFIRMED_KEY = "sparkfined_confirmed_entries";
const SETTINGS_KEY = "sparkfined_extended_settings";

// State
let pendingEntries: AutoCapturedEntry[] = [];
let archivedEntries: ArchivedEntry[] = [];
let confirmedEntries: ConfirmedEntry[] = [];
let extendedSettings: ExtendedDataSettings = {
  preset: "default",
  marketContext: true,
  technicalIndicators: true,
  onChainMetrics: false,
  customTimeframes: ["1h", "4h", "1d"],
};

// Load from localStorage
try {
  const storedPending = localStorage.getItem(PENDING_KEY);
  if (storedPending) pendingEntries = JSON.parse(storedPending);

  const storedArchived = localStorage.getItem(ARCHIVED_KEY);
  if (storedArchived) archivedEntries = JSON.parse(storedArchived);

  const storedConfirmed = localStorage.getItem(CONFIRMED_KEY);
  if (storedConfirmed) confirmedEntries = JSON.parse(storedConfirmed);

  const storedSettings = localStorage.getItem(SETTINGS_KEY);
  if (storedSettings) extendedSettings = JSON.parse(storedSettings);
} catch {
  // Keep defaults
}

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
  // Notify handbook context that entries may have changed
  notifyContextChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Snapshots
function getPendingSnapshot() {
  return pendingEntries;
}

function getArchivedSnapshot() {
  return archivedEntries;
}

function getConfirmedSnapshot() {
  return confirmedEntries;
}

function getSettingsSnapshot() {
  return extendedSettings;
}

// Helper: compute derived fields for pending entry
function computeDerived(entry: AutoCapturedEntry): AutoCapturedEntry {
  const now = Date.now();
  const expiresAt = new Date(entry.expiresAt).getTime();
  const timeLeftMs = Math.max(0, expiresAt - now);
  
  // Check if full exit (no remaining position)
  const totalBought = entry.txs
    .filter((tx) => tx.type === "BUY")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSold = entry.txs
    .filter((tx) => tx.type === "SELL")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const isFullExit = totalSold >= totalBought && totalSold > 0;

  // Determine status
  let status: PendingStatus = "active";
  if (isFullExit) {
    status = "ready";
  } else if (timeLeftMs < 3600000) {
    // < 1 hour
    status = "expiring";
  }

  return { ...entry, isFullExit, timeLeftMs, status };
}

// Actions
function addPendingEntry(entry: Omit<AutoCapturedEntry, "id">) {
  const newEntry: AutoCapturedEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  pendingEntries = [computeDerived(newEntry), ...pendingEntries];
  localStorage.setItem(PENDING_KEY, JSON.stringify(pendingEntries));
  emitChange();
  return newEntry;
}

function updatePendingEntry(id: string, updates: Partial<AutoCapturedEntry>) {
  pendingEntries = pendingEntries.map((entry) =>
    entry.id === id ? computeDerived({ ...entry, ...updates }) : entry
  );
  localStorage.setItem(PENDING_KEY, JSON.stringify(pendingEntries));
  emitChange();
}

function archiveEntry(id: string, reason: ArchiveReason) {
  const entry = pendingEntries.find((e) => e.id === id);
  if (!entry) return;

  const archivedEntry: ArchivedEntry = {
    ...entry,
    archivedAt: new Date().toISOString(),
    archiveReason: reason,
  };

  pendingEntries = pendingEntries.filter((e) => e.id !== id);
  archivedEntries = [archivedEntry, ...archivedEntries];

  localStorage.setItem(PENDING_KEY, JSON.stringify(pendingEntries));
  localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archivedEntries));
  emitChange();
  
  return archivedEntry;
}

function confirmEntry(id: string, enrichment: EntryEnrichment, fromArchive = false) {
  const source = fromArchive ? archivedEntries : pendingEntries;
  const entry = source.find((e) => e.id === id);
  if (!entry) return;

  const confirmedEntry: ConfirmedEntry = {
    ...entry,
    confirmedAt: new Date().toISOString(),
    enrichment,
  };

  if (fromArchive) {
    archivedEntries = archivedEntries.filter((e) => e.id !== id);
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archivedEntries));
  } else {
    pendingEntries = pendingEntries.filter((e) => e.id !== id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(pendingEntries));
  }

  confirmedEntries = [confirmedEntry, ...confirmedEntries];
  localStorage.setItem(CONFIRMED_KEY, JSON.stringify(confirmedEntries));
  emitChange();

  return confirmedEntry;
}

function deletePendingEntry(id: string) {
  pendingEntries = pendingEntries.filter((e) => e.id !== id);
  localStorage.setItem(PENDING_KEY, JSON.stringify(pendingEntries));
  emitChange();
}

function deleteArchivedEntry(id: string) {
  archivedEntries = archivedEntries.filter((e) => e.id !== id);
  localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archivedEntries));
  emitChange();
}

function updateExtendedSettings(updates: Partial<ExtendedDataSettings>) {
  extendedSettings = { ...extendedSettings, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(extendedSettings));
  emitChange();
}

// Refresh derived fields (call periodically)
function refreshPendingDerived() {
  pendingEntries = pendingEntries.map(computeDerived);
  localStorage.setItem(PENDING_KEY, JSON.stringify(pendingEntries));
  emitChange();
}

// Check for expired entries
function processExpiredEntries() {
  const now = Date.now();
  const expired = pendingEntries.filter(
    (entry) => new Date(entry.expiresAt).getTime() <= now
  );
  
  expired.forEach((entry) => {
    archiveEntry(entry.id, "expired");
  });
}

// Hook
export function useJournalStore() {
  const pending = useSyncExternalStore(subscribe, getPendingSnapshot, getPendingSnapshot);
  const archived = useSyncExternalStore(subscribe, getArchivedSnapshot, getArchivedSnapshot);
  const confirmed = useSyncExternalStore(subscribe, getConfirmedSnapshot, getConfirmedSnapshot);
  const settings = useSyncExternalStore(subscribe, getSettingsSnapshot, getSettingsSnapshot);

  return {
    // State
    pendingEntries: pending,
    archivedEntries: archived,
    confirmedEntries: confirmed,
    extendedSettings: settings,

    // Counts
    pendingCount: pending.length,
    archivedCount: archived.length,
    confirmedCount: confirmed.length,

    // Actions
    addPendingEntry: useCallback(addPendingEntry, []),
    updatePendingEntry: useCallback(updatePendingEntry, []),
    archiveEntry: useCallback(archiveEntry, []),
    confirmEntry: useCallback(confirmEntry, []),
    deletePendingEntry: useCallback(deletePendingEntry, []),
    deleteArchivedEntry: useCallback(deleteArchivedEntry, []),
    updateExtendedSettings: useCallback(updateExtendedSettings, []),
    refreshPendingDerived: useCallback(refreshPendingDerived, []),
    processExpiredEntries: useCallback(processExpiredEntries, []),
  };
}

// Export standalone for demo/testing
export {
  addPendingEntry,
  archiveEntry,
  confirmEntry,
  deletePendingEntry,
};
