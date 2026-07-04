import { HttpClient } from '../http';
import { Profile } from '../types';

export class ProfilesModule {
    constructor(private http: HttpClient) {}

    public async getProfile(address: string): Promise<{ data: Profile | null }> {
        const query = { address };
        const data = await this.http.get<Profile[] | Profile>('gamma', '/public-profile', query);
        
        return { data: Array.isArray(data) ? data[0] : (data || null) };
    }
}
