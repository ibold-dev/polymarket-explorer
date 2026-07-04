import { Position, Trade } from '../types';

export class AnalyticsEngine {
    /**
     * Calculates Unrealized PnL from a list of current positions and current market prices.
     * Note: the Polymarket API does not directly expose "entry price" in the /positions endpoint. 
     * You often have to cross-reference with trades or use the `initial_value` if provided.
     * Assuming Position contains standard PnL fields if available.
     */
    public static calculateUnrealizedPnL(positions: Position[]): number {
        // Simplified fallback calculation if fields are missing. 
        // In a real scenario, you sum up current value - initial value
        return positions.reduce((total, pos) => {
            const currentValue = pos.currentValue || 0;
            const initialValue = pos.initialValue || 0;
            return total + (currentValue - initialValue);
        }, 0);
    }

    /**
     * Calculates Realized PnL from a list of trades and closed positions.
     */
    public static calculateRealizedPnL(trades: Trade[]): number {
        // Simplified PnL calculation: Net cash flow of trades for an asset
        // (Sells - Buys)
        return trades.reduce((total, trade) => {
            const value = Number(trade.size) * Number(trade.price);
            if (trade.side === 'SELL') {
                return total + value;
            } else if (trade.side === 'BUY') {
                return total - value;
            }
            return total;
        }, 0);
    }

    /**
     * Calculates portfolio summary metrics.
     */
    public static getPortfolioSummary(positions: Position[], trades: Trade[]) {
        const unrealized = this.calculateUnrealizedPnL(positions);
        const realized = this.calculateRealizedPnL(trades);
        
        return {
            unrealizedPnL: unrealized,
            realizedPnL: realized,
            totalPnL: unrealized + realized
        };
    }
}
