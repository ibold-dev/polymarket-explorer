import type { PnlCandlestickBar, Trade, PositionEntry } from './types';
import { getPolymarketClient } from './client';

export async function fetchTraderPositions(address: string): Promise<PositionEntry[]> {
  try {
    const res = await fetch(`https://data-api.polymarket.com/positions?user=${address}`);
    if (!res.ok) return [];
    return await res.json() as PositionEntry[];
  } catch (e) {
    console.error("Failed to fetch positions", e);
    return [];
  }
}

export async function fetchTraderTrades(address: string): Promise<Trade[]> {
  try {
    const res = await fetch(`https://data-api.polymarket.com/trades?user=${address}`);
    if (!res.ok) return [];
    return await res.json() as Trade[];
  } catch (e) {
    console.error("Failed to fetch trades", e);
    return [];
  }
}

/**
 * Custom local calculation of Trader PnL candles.
 * Replaces the structbuild analytics endpoint.
 * Note: A true historical mark-to-market PnL requires backend indexing.
 * This provides a simplified version based on trades and current positions.
 */
export async function fetchTraderPnlCandles(address: string): Promise<PnlCandlestickBar[]> {
  const [positions, trades] = await Promise.all([
    fetchTraderPositions(address),
    fetchTraderTrades(address)
  ]);

  if (!trades.length && !positions.length) return [];

  // Very simplified: just compute current PnL from positions
  let totalCashPnl = 0;
  let totalInitialValue = 0;

  positions.forEach(p => {
    totalCashPnl += ((p as any).cashPnl || 0);
    totalInitialValue += ((p as any).initialValue || 0);
  });

  const now = Math.floor(Date.now() / 1000);
  const start = now - (30 * 24 * 60 * 60);

  // Return a static flat candle chart representing the current state
  // In a real application, this would be grouped by day and historical asset prices applied
  const mockCandles: PnlCandlestickBar[] = [];
  
  for (let i = 0; i <= 30; i++) {
    const ts = start + (i * 24 * 60 * 60);
    mockCandles.push({
      timestamp: ts,
      pnl: totalCashPnl,
      total_buys: totalInitialValue,
      total_sells: 0,
      total_volume: totalInitialValue,
      realized_pnl: positions.reduce((acc, p) => acc + ((p as any).realizedPnl || 0), 0),
      unrealized_pnl: totalCashPnl - positions.reduce((acc, p) => acc + ((p as any).realizedPnl || 0), 0),
      initial_value: totalInitialValue,
      current_value: totalInitialValue + totalCashPnl,
      open_positions: positions.length
    } as any);
  }

  return mockCandles;
}
