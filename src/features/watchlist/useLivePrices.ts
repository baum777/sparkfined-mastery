import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PriceData {
  symbol: string;
  price: number | null;
  change24h: number | null;
  source: string;
  error?: string;
}

interface PriceCache {
  [symbol: string]: {
    price: number;
    change24h: number;
    timestamp: number;
  };
}

const CACHE_TTL = 30000; // 30 seconds cache
const REFRESH_INTERVAL = 60000; // Refresh every 60 seconds

export function useLivePrices(symbols: string[]) {
  const [prices, setPrices] = useState<PriceCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchPrices = useCallback(async (symbolsToFetch: string[]) => {
    if (symbolsToFetch.length === 0 || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Filter out symbols that are still fresh in cache
      const now = Date.now();
      const staleSymbols = symbolsToFetch.filter(s => {
        const cached = prices[s];
        return !cached || (now - cached.timestamp) > CACHE_TTL;
      });

      if (staleSymbols.length === 0) {
        setIsLoading(false);
        fetchingRef.current = false;
        return;
      }

      console.log("[useLivePrices] Fetching prices for:", staleSymbols.join(", "));

      const { data, error: fnError } = await supabase.functions.invoke('get-token-price', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });

      // Use fetch directly since we need query params
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-token-price?symbols=${staleSymbols.join(',')}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.status}`);
      }

      const result = await response.json();
      console.log("[useLivePrices] Received:", result);

      if (result.prices) {
        const newPrices: PriceCache = { ...prices };
        const timestamp = Date.now();

        for (const priceData of result.prices as PriceData[]) {
          if (priceData.price !== null) {
            newPrices[priceData.symbol] = {
              price: priceData.price,
              change24h: priceData.change24h ?? 0,
              timestamp,
            };
          }
        }

        setPrices(newPrices);
      }
    } catch (err) {
      console.error("[useLivePrices] Error:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [prices]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (symbols.length === 0) return;

    // Extract base symbols from pairs like "BTC/USD" -> "BTC"
    const baseSymbols = symbols.map(s => s.split('/')[0]);
    
    // Initial fetch
    fetchPrices(baseSymbols);

    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchPrices(baseSymbols);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [symbols.join(',')]); // Only re-run when symbols list changes

  const getPrice = useCallback((symbol: string) => {
    const baseSymbol = symbol.split('/')[0];
    return prices[baseSymbol] || null;
  }, [prices]);

  const refresh = useCallback(() => {
    const baseSymbols = symbols.map(s => s.split('/')[0]);
    // Clear cache timestamps to force refresh
    setPrices(prev => {
      const cleared: PriceCache = {};
      for (const [key, value] of Object.entries(prev)) {
        cleared[key] = { ...value, timestamp: 0 };
      }
      return cleared;
    });
    fetchPrices(baseSymbols);
  }, [symbols, fetchPrices]);

  return {
    prices,
    getPrice,
    isLoading,
    error,
    refresh,
  };
}
