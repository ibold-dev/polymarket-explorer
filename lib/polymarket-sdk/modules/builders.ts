import { HttpClient } from '../http';

export class BuildersModule {
    constructor(private http: HttpClient) {}

    public async getBuilders(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilder(): Promise<{ data: any }> { return { data: null }; }
    public async getBuilderMetadata(): Promise<{ data: any }> { return { data: null }; }
    public async getBuilderConcentration(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderFees(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderFeesHistory(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderRetention(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderTags(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderTopTraders(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getComposition(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getGlobal(): Promise<{ data: any }> { return { data: null }; }
    public async getGlobalChanges(): Promise<{ data: any }> { return { data: null }; }
    public async getGlobalTags(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderDeltas(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderTimeseries(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getBuilderChanges(): Promise<{ data: any }> { return { data: null }; }
    public async getGlobalDeltas(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getGlobalTimeseries(): Promise<{ data: any[] }> { return { data: [] }; }
    public async getTagBuilders(): Promise<{ data: any[] }> { return { data: [] }; }
}
