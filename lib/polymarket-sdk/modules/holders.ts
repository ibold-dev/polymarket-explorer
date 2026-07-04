import { HttpClient } from '../http';

export class HoldersModule {
    constructor(private http: HttpClient) {}

    public async getMarketHolders(): Promise<{ data: any[] }> {
        return { data: [] };
    }

    public async getMarketHoldersHistory(): Promise<{ data: any[] }> {
        return { data: [] };
    }
}
