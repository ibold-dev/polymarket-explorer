import { HttpClient } from '../http';

export class TradersModule {
    constructor(private http: HttpClient) {}

    public async getGlobalPnl(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getTraderPnlCandles(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getTraderPnlChanges(): Promise<{ data: { changes: any[] } }> { return { data: { changes: [] } }; }
    public async getTraderPnlPeriods(): Promise<{ data: any }> { return { data: { "1d": null, "7d": null, "30d": null, max: null } }; }
    public async getTraderPnlRisk(): Promise<{ data: any }> { return { data: { current_risk: 0, max_risk: 0 } }; }
    public async getTraderMarketPnl(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getTraderCategoryPnl(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getTraderPnlExits(): Promise<{ data: any[] }> { return { data: [] }; }
}
