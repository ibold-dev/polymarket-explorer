import { HttpClient } from '../http';
import { Event } from '../types';

export interface GetEventsParams {
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    status?: 'open' | 'closed' | 'all';
    tags?: string; // comma separated slugs
    search?: string;
}

export class EventsModule {
    constructor(private http: HttpClient) {}

    public async getEvents(params: GetEventsParams = {}): Promise<{ data: Event[], pagination?: any }> {
        const query: Record<string, string | number | undefined> = {
            limit: params.limit,
            offset: params.offset,
        };

        if (params.sort_by) query.order = params.sort_by;
        if (params.sort_dir === 'asc') query.ascending = 'true';
        
        if (params.status === 'open') query.active = 'true';
        else if (params.status === 'closed') query.closed = 'true';

        if (params.tags) query.tag_slug = params.tags;
        if (params.search) query.title = params.search; // Or q, or search depending on Gamma

        const data = await this.http.get<Event[]>('gamma', '/events', query);
        
        return { 
            data: data || [], 
            pagination: { has_more: Array.isArray(data) && data.length >= (params.limit || 20) } 
        };
    }

    public async getEventsKeyset(params: GetEventsParams = {}): Promise<{ data: Event[], pagination?: any }> {
        const query: Record<string, string | number | undefined> = {
            limit: params.limit,
            offset: params.offset,
        };

        if (params.sort_by) query.order = params.sort_by;
        if (params.sort_dir === 'asc') query.ascending = 'true';
        
        if (params.status === 'open') query.active = 'true';
        else if (params.status === 'closed') query.closed = 'true';

        if (params.tags) query.tag_slug = params.tags;
        if (params.search) query.title = params.search; 

        const data = await this.http.get<Event[]>('gamma', '/events/keyset', query);
        
        return { 
            data: data || [], 
            pagination: { has_more: Array.isArray(data) && data.length >= (params.limit || 20) } 
        };
    }

    public async getEventBySlug(slug: string): Promise<{ data: Event | null }> {
        const data = await this.http.get<Event[] | Event>('gamma', `/events/slug/${slug}`);
        return { data: Array.isArray(data) ? data[0] : (data || null) };
    }
}
