import { HttpClient } from '../http';

export interface GetActivityParams {
    user: string;
    limit?: number;
    offset?: number;
}

export class ActivityModule {
    constructor(private http: HttpClient) {}

    public async getUserActivity(params: GetActivityParams): Promise<{ data: any[] }> {
        const query: Record<string, string | number> = { user: params.user };
        if (params.limit) query.limit = params.limit;
        if (params.offset) query.offset = params.offset;

        const data = await this.http.get<any[]>('data', '/activity', query);
        return { data: data || [] };
    }
}
