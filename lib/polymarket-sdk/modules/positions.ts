import { HttpClient } from '../http';
import { Position } from '../types';

export interface GetPositionsParams {
    user?: string;
    limit?: number;
    offset?: number;
    status?: 'open' | 'closed';
}

export interface GetMarketPositionsParams {
    market: string;
    limit?: number;
    offset?: number;
}

export class PositionsModule {
    constructor(private http: HttpClient) {}

    public async getPositions(params: GetPositionsParams): Promise<{ data: Position[] }> {
        const query: Record<string, string | number> = {};
        if (params.user) query.user = params.user;
        if (params.limit) query.limit = params.limit;
        if (params.offset) query.offset = params.offset;
        
        const endpoint = params.status === 'closed' ? '/closed-positions' : '/positions';
        const data = await this.http.get<Position[]>('data', endpoint, query);
        
        return { data: data || [] };
    }

    public async getPositionValue(user: string): Promise<{ data: any }> {
        const data = await this.http.get<any>('data', '/value', { user });
        return { data: data || { value: 0 } };
    }

    public async getPositionsForMarket(params: GetMarketPositionsParams): Promise<{ data: Position[] }> {
        const query: Record<string, string | number> = { market: params.market };
        if (params.limit) query.limit = params.limit;
        if (params.offset) query.offset = params.offset;

        const data = await this.http.get<Position[]>('data', '/v1/market-positions', query);
        return { data: data || [] };
    }
}
