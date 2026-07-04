export {
	getMarketBySlug,
	getTopMarkets,
	getHomeTopMarkets,
	getAllMarketSlugs,
	getPlatformCounts,
} from "@/lib/polymarket/queries/markets";

export {
	defaultMarketTradesPageSize,
	getMarketTradesPage,
	getRecentTrades,
} from "@/lib/polymarket/queries/market-trades";
export type {
	GetMarketTradesRequest,
	MarketTradesPageOptions,
} from "@/lib/polymarket/queries/market-trades";

export {
	getCategoryLeaderboard,
	getGlobalLeaderboard,
	getMarketHolders,
	getMarketHoldersHistory,
} from "@/lib/polymarket/queries/market-holders";
export type { TraderLeaderboardEntry } from "@/lib/polymarket/queries/market-holders";

export {
	getMarketChart,
	getMarketPriceJumps,
	getPositionVolumeChart,
	toVolumePoints,
} from "@/lib/polymarket/queries/market-charts";

export {
	getAllTags,
	getMarketsByTag,
	getTagBySlug,
	getTagCount,
	getTagPageCount,
	getTagsPaginated,
} from "@/lib/polymarket/queries/market-tags";

export type { PaginatedResult } from "@/lib/polymarket/queries/_shared";
