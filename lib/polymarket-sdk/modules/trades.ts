import { HttpClient } from '../http';
import { Trade } from '../types';

export interface GetTradesParams {
    user?: string;
    market?: string;
    maker?: string;
    limit?: number;
    offset?: number;
}

export class TradesModule {
    constructor(private http: HttpClient) {}

    public async getTrades(params: GetTradesParams): Promise<{ data: Trade[] }> {
        const query: Record<string, string | number> = {};
        if (params.user) query.user = params.user;
        if (params.market) query.market = params.market;
        if (params.maker) query.maker = params.maker;
        if (params.limit) query.limit = params.limit;
        if (params.offset) query.offset = params.offset;

        const data = await this.http.get<Trade[]>('data', '/trades', query);
        return { data: data || [] };
    }

    public async getTotalMarketsTraded(user: string): Promise<{ data: any }> {
        const data = await this.http.get<any>('data', '/traded', { user });
        return { data: data || { total: 0 } };
    }
}
