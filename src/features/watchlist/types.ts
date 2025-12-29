export type TrendDirection = 'bullish' | 'bearish' | 'neutral';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  trend?: TrendDirection;
  relevance?: number; // 0-100 percentage
  price?: number;
  change24h?: number; // percentage change
  addedAt: Date;
}

export interface RecentlyViewedToken {
  symbol: string;
  name: string;
  price?: number;
  change24h?: number;
  viewedAt: Date;
}
