import { createPublicClient } from '@polymarket/client';

export function getPolymarketClient(): any {
  const sdk = createPublicClient();

  const gammaBase = "https://gamma-api.polymarket.com";
  const dataBase = "https://data-api.polymarket.com";

  async function fetchGamma(path: string, params: Record<string, any> = {}) {
    const url = new URL(`${gammaBase}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.append(key, String(value));
    });
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Gamma API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data;
  }

  async function fetchData(path: string, params: Record<string, any> = {}) {
    const url = new URL(`${dataBase}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.append(key, String(value));
    });
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Data API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    return data;
  }

  return {
    sdk,
    events: {
      getEvents: async (params: any = {}) => {
        const query: any = { limit: params.limit, offset: params.offset, order: params.sort_by };
        if (params.sort_dir === 'asc') query.ascending = 'true';
        if (params.status === 'open') query.active = 'true';
        if (params.status === 'closed') query.closed = 'true';
        if (params.tags) query.tag_slug = params.tags;

        const data = await fetchGamma('/events', query);
        return { data, pagination: { has_more: Array.isArray(data) && data.length >= (params.limit || 20) } };
      },
      getEventBySlug: async ({ slug }: { slug: string }) => {
        const data = await fetchGamma(`/events/slug/${slug}`);
        return { data: Array.isArray(data) ? data[0] : (data || null) };
      },
      getEventChart: async () => ({ data: [] }),
      getEventMetrics: async () => ({ data: [] })
    },
    markets: {
      getMarkets: async (params: any = {}) => {
        const query: any = { limit: params.limit, offset: params.offset, order: params.sort_by };
        if (params.sort_dir === 'asc') query.ascending = 'true';
        if (params.status === 'open') query.active = 'true';
        if (params.status === 'closed') query.closed = 'true';

        const data = await fetchGamma('/markets', query);
        return { data, pagination: { has_more: Array.isArray(data) && data.length >= (params.limit || 20) } };
      },
      getMarketBySlug: async ({ marketSlug }: { marketSlug: string }) => {
        const data = await fetchGamma(`/markets/slug/${marketSlug}`);
        return { data: Array.isArray(data) ? data[0] : (data || null) };
      },
      getTrades: async (params: any = {}) => {
        const query: any = { limit: params.limit, offset: params.offset };
        if (params.condition_ids) query.market = params.condition_ids;
        if (params.maker) query.user = params.maker;

        const data = await fetchData('/trades', query);
        return { data };
      },
      getMarketChart: async () => ({ data: [] }),
      getPositionVolumeChart: async () => ({ data: [] }),
      getPriceJumps: async () => ({ data: [] })
    },
    holders: {
      getMarketHolders: async () => ({ data: [] }),
      getMarketHoldersHistory: async () => ({ data: [] })
    },
    trader: {
      getGlobalPnl: async () => ({ data: [] })
    },
    tags: {
      getTags: async (params: any = {}) => {
        const data = await fetchGamma('/tags', { limit: params.limit, offset: params.offset });
        return { data };
      },
      getCategoryTopTraders: async () => ({ data: [] })
    },
    analytics: {
      getCounts: async () => ({ data: null })
    },
    builders: {
      getBuilders: async () => ({ data: [] }),
      getBuilder: async () => ({ data: null }),
      getBuilderMetadata: async () => ({ data: null }),
      getBuilderConcentration: async () => ({ data: [] }),
      getBuilderFees: async () => ({ data: [] }),
      getBuilderFeesHistory: async () => ({ data: [] }),
      getBuilderRetention: async () => ({ data: [] }),
      getBuilderTags: async () => ({ data: [] }),
      getBuilderTopTraders: async () => ({ data: [] }),
      getComposition: async () => ({ data: [] }),
      getGlobal: async () => ({ data: null }),
      getGlobalChanges: async () => ({ data: null }),
      getGlobalTags: async () => ({ data: [] }),
      getTagBuilders: async () => ({ data: [] })
    }
  };
}
