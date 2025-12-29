import { useState, useCallback, useEffect } from 'react';
import type { RecentlyViewedToken } from './types';

const STORAGE_KEY = "sparkfined_recently_viewed";
const MAX_ITEMS = 10;

// Mock price data for recently viewed tokens
const MOCK_PRICES: Record<string, { price: number; change24h: number }> = {
  BTC: { price: 94250.32, change24h: 2.34 },
  ETH: { price: 3420.18, change24h: -0.87 },
  SOL: { price: 189.45, change24h: -3.21 },
  DOGE: { price: 0.3215, change24h: 5.67 },
  XRP: { price: 2.18, change24h: 1.23 },
  ADA: { price: 0.89, change24h: -1.45 },
  AVAX: { price: 38.92, change24h: 4.12 },
  LINK: { price: 22.45, change24h: 0.56 },
  DOT: { price: 7.23, change24h: -2.34 },
  MATIC: { price: 0.52, change24h: 3.45 },
};

function loadRecentlyViewed(): RecentlyViewedToken[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: RecentlyViewedToken) => ({
        ...item,
        viewedAt: new Date(item.viewedAt),
        // Add mock price data if available
        price: MOCK_PRICES[item.symbol]?.price ?? item.price,
        change24h: MOCK_PRICES[item.symbol]?.change24h ?? item.change24h,
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
      
      // Get mock price data if available
      const priceData = MOCK_PRICES[symbol.toUpperCase()];
      
      // Add new entry at the beginning
      const newItem: RecentlyViewedToken = {
        symbol: symbol.toUpperCase(),
        name: name || symbol.toUpperCase(),
        price: priceData?.price,
        change24h: priceData?.change24h,
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

export type { RecentlyViewedToken };
