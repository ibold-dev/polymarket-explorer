export type ApiHost = "gamma" | "data" | "clob";

const HOST_URLS: Record<ApiHost, string> = {
    gamma: "https://gamma-api.polymarket.com",
    data: "https://data-api.polymarket.com",
    clob: "https://clob.polymarket.com",
};

export class PolymarketError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public body: string,
        message?: string
    ) {
        super(message || `Polymarket API Error: ${status} ${statusText} - ${body}`);
        this.name = "PolymarketError";
    }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: any; // Automatically stringified if object
    params?: Record<string, string | number | boolean | undefined | null>;
}

export class HttpClient {
    private async request<T>(host: ApiHost, path: string, options: RequestOptions = {}): Promise<T> {
        const baseUrl = HOST_URLS[host];
        const url = new URL(path.startsWith('/') ? path : `/${path}`, baseUrl);

        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value.toString());
                }
            });
        }

        const headers = new Headers(options.headers);
        if (!headers.has('Accept')) {
            headers.set('Accept', 'application/json');
        }

        let body = options.body;
        if (body && typeof body === 'object' && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
            body = JSON.stringify(body);
        }

        const fetchOptions: RequestInit = {
            ...options,
            headers,
            body: body as any,
        };

        const response = await fetch(url.toString(), fetchOptions);

        if (!response.ok) {
            let errorBody = await response.text().catch(() => "");
            throw new PolymarketError(response.status, response.statusText, errorBody);
        }

        const text = await response.text();
        if (!text) {
            return null as unknown as T;
        }

        try {
            return JSON.parse(text) as T;
        } catch (e) {
            throw new Error(`Failed to parse Polymarket JSON response: ${text}`);
        }
    }

    public async get<T>(
        host: ApiHost, 
        path: string, 
        params?: Record<string, string | number | boolean | undefined | null>, 
        headers?: HeadersInit
    ): Promise<T> {
        return this.request<T>(host, path, { method: 'GET', params, headers });
    }

    public async post<T>(
        host: ApiHost, 
        path: string, 
        body?: any, 
        params?: Record<string, string | number | boolean | undefined | null>, 
        headers?: HeadersInit
    ): Promise<T> {
        return this.request<T>(host, path, { method: 'POST', body, params, headers });
    }
}
