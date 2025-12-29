import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = "sparkfined_recently_viewed";
const MAX_ITEMS = 10;

export interface RecentlyViewedToken {
  symbol: string;
  name: string;
  viewedAt: Date;
}

function loadRecentlyViewed(): RecentlyViewedToken[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: RecentlyViewedToken) => ({
        ...item,
        viewedAt: new Date(item.viewedAt),
      }));
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveRecentlyViewed(items: RecentlyViewedToken[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedToken[]>(() => loadRecentlyViewed());

  // Persist whenever items change
  useEffect(() => {
    saveRecentlyViewed(items);
  }, [items]);

  const addToken = useCallback((symbol: string, name?: string) => {
    setItems((prev) => {
      // Remove existing entry for this symbol
      const filtered = prev.filter((item) => item.symbol !== symbol);
      
      // Add new entry at the beginning
      const newItem: RecentlyViewedToken = {
        symbol: symbol.toUpperCase(),
        name: name || symbol.toUpperCase(),
        viewedAt: new Date(),
      };
      
      // Keep only MAX_ITEMS
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addToken,
    clearAll,
  };
}
