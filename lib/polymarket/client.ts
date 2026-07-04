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
      getGlobalPnl: async () => ({ data: [] }),
      getTraderProfile: async (params: any = {}) => ({
        data: {
          proxy_wallet: params.address || "",
          display_username_public: true,
          verified_badge: false,
          is_creator: false,
          is_mod: false,
          name: params.address ? `Trader ${params.address.substring(0, 6)}` : "Trader"
        }
      }),
      getTraderPnl: async (params: any = {}) => ({
        data: {
          trader: { address: params.address || "" },
          realized_pnl_usd: 0,
          total_pnl_usd: 0,
          unrealized_pnl_usd: 0,
          usd_balance: 0,
          realized_pnl_percent: 0,
          unrealized_pnl_percent: 0,
          total_pnl_percent: 0,
          buy_count: 0,
          sell_count: 0,
          total_buys: 0,
          total_sells: 0,
          total_fees: 0,
          total_shares_bought: 0,
          total_shares_sold: 0,
        }
      }),
      getTraderPnlCandles: async () => ({ data: [] }),
      getTraderPnlChanges: async () => ({ data: { changes: [] } }),
      getTraderPnlPeriods: async () => ({ data: { "1d": null, "7d": null, "30d": null, max: null } }),
      getTraderPnlRisk: async () => ({ data: { current_risk: 0, max_risk: 0 } }),
      getTraderMarketPnl: async () => ({ data: [] }),
      getTraderCategoryPnl: async () => ({ data: [] }),
      getTraderOutcomePnl: async () => ({ data: [] }),
      getTraderPnlExits: async () => ({ data: [] }),
      getTraderTrades: async (params: any = {}) => {
        const query: any = { limit: params.limit, offset: params.offset };
        if (params.address) query.user = params.address;
        const data = await fetchData('/trades', query);
        return { data };
      },
      getTopTradesMarkets: async (params: any = {}) => {
        const data = await fetchData('/trades', { limit: params.limit, offset: params.offset });
        return { data };
      }
    },
    tags: {
      getTags: async (params: any = {}) => {
        const data = await fetchGamma('/tags', { limit: params.limit, offset: params.offset });
        return { data };
      },
      getCategoryTopTraders: async () => ({ data: [] })
    },
    analytics: {
      getCounts: async () => ({ data: null }),
      getTraderChanges: async () => ({ data: null }),
      getTraderDeltas: async () => ({ data: [] })
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
    },
    search: {
      search: async (params: any = {}) => {
        const q = params.q || "";
        const data: any = { traders: [], markets: [], events: [], builders: [] };
        
        if (q.startsWith("0x") && q.length === 42) {
          data.traders.push({ address: q });
        }
        
        return { data };
      }
    }
  };
}
