import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token address mappings for different networks
const TOKEN_ADDRESSES: Record<string, { network: string; address: string; type: 'dexpaprika' | 'moralis' }> = {
  // Solana tokens (use DexPaprika - free, no API key needed)
  'SOL': { network: 'solana', address: 'So11111111111111111111111111111111111111112', type: 'dexpaprika' },
  'BONK': { network: 'solana', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', type: 'dexpaprika' },
  'JUP': { network: 'solana', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', type: 'dexpaprika' },
  'WIF': { network: 'solana', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', type: 'dexpaprika' },
  
  // EVM tokens (use Moralis - requires API key)
  'BTC': { network: 'eth', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', type: 'moralis' }, // WBTC
  'ETH': { network: 'eth', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', type: 'moralis' }, // WETH
  'AVAX': { network: 'avalanche', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', type: 'moralis' }, // WAVAX
  'LINK': { network: 'eth', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', type: 'moralis' },
  'UNI': { network: 'eth', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', type: 'moralis' },
  'AAVE': { network: 'eth', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', type: 'moralis' },
};

// Moralis chain IDs
const MORALIS_CHAINS: Record<string, string> = {
  'eth': '0x1',
  'bsc': '0x38',
  'polygon': '0x89',
  'avalanche': '0xa86a',
  'arbitrum': '0xa4b1',
};

interface PriceResponse {
  symbol: string;
  price: number | null;
  change24h: number | null;
  source: string;
  error?: string;
}

async function fetchDexPaprikaPrice(network: string, address: string): Promise<{ price: number; change24h: number }> {
  const url = `https://api.dexpaprika.com/networks/${network}/tokens/${address}`;
  console.log(`[DexPaprika] Fetching: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`DexPaprika API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`[DexPaprika] Response for ${address}:`, JSON.stringify(data).slice(0, 200));
  
  return {
    price: data.price_usd || 0,
    change24h: data.price_change_24h_percent || 0,
  };
}

async function fetchMoralisPrice(chain: string, address: string, apiKey: string): Promise<{ price: number; change24h: number }> {
  const chainId = MORALIS_CHAINS[chain] || '0x1';
  const url = `https://deep-index.moralis.io/api/v2.2/erc20/${address}/price?chain=${chainId}&include=percent_change`;
  console.log(`[Moralis] Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'X-API-Key': apiKey,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Moralis] API error: ${response.status} - ${errorText}`);
    throw new Error(`Moralis API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`[Moralis] Response for ${address}:`, JSON.stringify(data).slice(0, 200));
  
  return {
    price: data.usdPrice || 0,
    change24h: parseFloat(data['24hrPercentChange']) || 0,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbolsParam = url.searchParams.get('symbols');
    
    if (!symbolsParam) {
      return new Response(
        JSON.stringify({ error: 'Missing symbols parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
    console.log(`[get-token-price] Fetching prices for: ${symbols.join(', ')}`);

    const moralisApiKey = Deno.env.get('MORALIS_API_KEY');
    const results: PriceResponse[] = [];

    for (const symbol of symbols) {
      const tokenInfo = TOKEN_ADDRESSES[symbol];
      
      if (!tokenInfo) {
        results.push({
          symbol,
          price: null,
          change24h: null,
          source: 'unknown',
          error: `Unknown token: ${symbol}`,
        });
        continue;
      }

      try {
        let priceData: { price: number; change24h: number };
        
        if (tokenInfo.type === 'dexpaprika') {
          priceData = await fetchDexPaprikaPrice(tokenInfo.network, tokenInfo.address);
          results.push({
            symbol,
            price: priceData.price,
            change24h: priceData.change24h,
            source: 'dexpaprika',
          });
        } else if (tokenInfo.type === 'moralis') {
          if (!moralisApiKey) {
            results.push({
              symbol,
              price: null,
              change24h: null,
              source: 'moralis',
              error: 'Moralis API key not configured',
            });
            continue;
          }
          priceData = await fetchMoralisPrice(tokenInfo.network, tokenInfo.address, moralisApiKey);
          results.push({
            symbol,
            price: priceData.price,
            change24h: priceData.change24h,
            source: 'moralis',
          });
        }
      } catch (error) {
        console.error(`[get-token-price] Error fetching ${symbol}:`, error);
        results.push({
          symbol,
          price: null,
          change24h: null,
          source: tokenInfo.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`[get-token-price] Returning ${results.length} results`);
    
    return new Response(
      JSON.stringify({ prices: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[get-token-price] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
