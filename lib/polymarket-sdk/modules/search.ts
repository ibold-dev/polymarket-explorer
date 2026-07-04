import { HttpClient } from '../http';

export interface SearchParams {
    q: string;
    limit?: number;
    type?: 'traders' | 'markets' | 'events' | 'builders';
}

export class SearchModule {
    constructor(private http: HttpClient) {}

    public async search(params: SearchParams): Promise<{ data: any }> {
        const query: Record<string, string | number | undefined> = {
            q: params.q,
            limit: params.limit,
            type: params.type,
        };
        const data = await this.http.get<any>('gamma', '/public-search', query);
        
        return { data: data || { traders: [], markets: [], events: [], builders: [] } };
    }
}
