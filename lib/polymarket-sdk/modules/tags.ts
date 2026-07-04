import { HttpClient } from '../http';
import { Tag } from '../types';

export interface GetTagsParams {
    limit?: number;
    offset?: number;
}

export class TagsModule {
    constructor(private http: HttpClient) {}

    public async getTags(params: GetTagsParams = {}): Promise<{ data: Tag[] }> {
        const data = await this.http.get<Tag[]>('gamma', '/tags', {
            limit: params.limit,
            offset: params.offset,
        });
        
        return { data: data || [] };
    }
}
