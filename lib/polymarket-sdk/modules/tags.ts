import { HttpClient } from '../http';
import { Tag } from '../types';

export interface GetTagsParams {
    limit?: number;
    offset?: number;
}

export class TagsModule {
    constructor(private http: HttpClient) {}

    public async getCategoryTopTraders(): Promise<{ data: any[] }> { return { data: [] }; }

    public async getTags(params: GetTagsParams = {}): Promise<{ data: Tag[], pagination?: any }> {
        const data = await this.http.get<Tag[]>('gamma', '/tags', {
            limit: params.limit,
            offset: params.offset,
        });
        
        return { data: data || [] };
    }
}
