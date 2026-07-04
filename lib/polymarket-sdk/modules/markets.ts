import { HttpClient } from '../http';
import { Market } from '../types';

export interface GetMarketsParams {
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    status?: 'open' | 'closed' | 'all';
}

export class MarketsModule {
    constructor(private http: HttpClient) {}

    public async getMarkets(params: GetMarketsParams = {}): Promise<{ data: Market[], pagination?: any }> {
        const query: Record<string, string | number | undefined> = {
            limit: params.limit,
            offset: params.offset,
        };

        if (params.sort_by) query.order = params.sort_by;
        if (params.sort_dir === 'asc') query.ascending = 'true';
        
        if (params.status === 'open') query.active = 'true';
        else if (params.status === 'closed') query.closed = 'true';

        const data = await this.http.get<Market[]>('gamma', '/markets', query);
        
        return { 
            data: data || [], 
            pagination: { has_more: Array.isArray(data) && data.length >= (params.limit || 20) } 
        };
    }

    public async getMarketsKeyset(params: GetMarketsParams = {}): Promise<{ data: Market[], pagination?: any }> {
        const query: Record<string, string | number | undefined> = {
            limit: params.limit,
            offset: params.offset,
        };

        if (params.sort_by) query.order = params.sort_by;
        if (params.sort_dir === 'asc') query.ascending = 'true';
        
        if (params.status === 'open') query.active = 'true';
        else if (params.status === 'closed') query.closed = 'true';

        const data = await this.http.get<Market[]>('gamma', '/markets/keyset', query);
        
        return { 
            data: data || [], 
            pagination: { has_more: Array.isArray(data) && data.length >= (params.limit || 20) } 
        };
    }

    public async getMarketBySlug(slug: string): Promise<{ data: Market | null }> {
        const data = await this.http.get<Market[] | Market>('gamma', `/markets/slug/${slug}`);
        return { data: Array.isArray(data) ? data[0] : (data || null) };
    }

    public async getMarketChart(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getPositionVolumeChart(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getPriceJumps(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getMarketTopTraders(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getPositionTopTraders(): Promise<{ data: any[] }> { return { data: [] }; }
}
