// Polymarket Core Types

export interface Profile {
    id: string;
    address: string;
    name?: string;
    description?: string;
    avatarUrl?: string;
    // other profile fields
}

export interface Trade {
    id: string;
    transactionHash: string;
    maker: string;
    taker: string;
    asset_id: string;
    market_slug: string;
    price: number;
    size: number;
    side: 'BUY' | 'SELL';
    timestamp: number;
}

export interface Position {
    id: string;
    asset: string;
    user: string;
    size: number;
    avgPrice: number;
    initialValue: number;
    currentValue: number;
    realizedPnl: number;
    unrealizedPnl: number;
}

export interface Event {
    id: string;
    slug: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    markets: Market[];
    tags: Tag[];
}

export interface Market {
    id: string;
    slug: string;
    conditionId: string;
    question: string;
    description: string;
    outcomes: string[];
    outcomePrices: number[];
    volume: number;
    active: boolean;
    closed: boolean;
    endDate: string;
}

export interface Tag {
    id: string;
    slug: string;
    label: string;
}

export interface Orderbook {
    market: string;
    bids: OrderbookEntry[];
    asks: OrderbookEntry[];
}

export interface OrderbookEntry {
    price: number;
    size: number;
}
