import "server-only";

import type {
	CategoryEntry,
	GlobalEntry,
	HolderHistoryCandle,
	MarketHoldersResponse,
	PolymarketCategory,
	TraderInfo,
} from "@structbuild/sdk";

import { getStructClient } from "@/lib/struct/client";
import { logStructError, readStatus } from "@/lib/struct/http";
import {
	logPaginationLimitReached,
	maxPaginationRequests,
	type PaginatedResult,
} from "@/lib/struct/queries/_shared";

const MAX_LEADERBOARD_PAGE_SIZE = 50;
const MAX_CATEGORY_LEADERBOARD_PAGE_SIZE = 200;

export type TraderLeaderboardEntry = Omit<GlobalEntry, "trader"> & {
	trader: TraderInfo;
	total_trades: number;
	best_trade_pnl_usd?: number | null;
	worst_trade_pnl_usd?: number | null;
};

export async function getMarketHolders(
	marketSlug: string,
	limit: number = 10,
): Promise<MarketHoldersResponse | null> {
	const client = getStructClient();

	if (!client) {
		return null;
	}

	try {
		const response = await client.holders.getMarketHolders({
			market_slug: marketSlug,
			limit,
			include_pnl: true,
		});
		return response.data;
	} catch (error) {
		if (readStatus(error) === 404) {
			return null;
		}

		logStructError(`getMarketHolders:${marketSlug}`, error);
		return null;
	}
}

export async function getMarketHoldersHistory(
	conditionId: string,
	hours: number = 336,
): Promise<HolderHistoryCandle[] | null> {
	const client = getStructClient();

	if (!client) {
		return null;
	}

	try {
		const response = await client.holders.getMarketHoldersHistory({
			condition_id: conditionId,
			hours,
		});
		return response.data;
	} catch (error) {
		if (readStatus(error) === 404) {
			return null;
		}

		logStructError(`getMarketHoldersHistory:${conditionId}`, error);
		return null;
	}
}

export type LeaderboardSortOptions = {
	sortBy?: string;
	sortDirection?: "asc" | "desc";
};

export async function getGlobalLeaderboard(
	timeframe: string = "lifetime",
	limit: number = MAX_LEADERBOARD_PAGE_SIZE,
	cursor?: string,
	sort?: LeaderboardSortOptions,
): Promise<PaginatedResult<TraderLeaderboardEntry>> {
	const client = getStructClient();

	if (!client) {
		return { data: [], hasMore: false, nextCursor: null };
	}

	const tf = timeframe as "1d" | "7d" | "30d" | "lifetime";
	const sortBy = (sort?.sortBy ?? "realized_pnl_usd") as Parameters<typeof client.trader.getGlobalPnlV3>[0]["sort_by"];
	const sortDirection = sort?.sortDirection ?? "desc";
	const data: TraderLeaderboardEntry[] = [];
	let paginationKey: string | undefined = cursor;
	let hasMore = false;

	try {
		let requestsMade = 0;

		while (data.length < limit) {
			if (requestsMade >= maxPaginationRequests) {
				logPaginationLimitReached("getGlobalLeaderboard");
				hasMore = false;
				break;
			}

			const chunkLimit = Math.min(MAX_LEADERBOARD_PAGE_SIZE, limit - data.length);
			const response = await client.trader.getGlobalPnlV3({
				timeframe: tf,
				sort_by: sortBy,
				sort_direction: sortDirection,
				limit: chunkLimit,
				pagination_key: paginationKey,
			});
			requestsMade += 1;
			const chunk = (response.data ?? []) as unknown as TraderLeaderboardEntry[];
			for (const entry of chunk) {
				data.push({
					...entry,
					total_trades:
						(entry.total_buys ?? 0)
						+ (entry.total_sells ?? 0)
						+ (entry.total_redemptions ?? 0)
						+ (entry.total_merges ?? 0),
				});
			}
			const nextKey = response.pagination?.pagination_key;
			const responseHasMore = response.pagination?.has_more ?? false;
			paginationKey = typeof nextKey === "string" && nextKey.length > 0 ? nextKey : undefined;
			if (!responseHasMore || !paginationKey || chunk.length < chunkLimit) {
				hasMore = responseHasMore && Boolean(paginationKey);
				break;
			}
			hasMore = true;
		}

		return {
			data,
			hasMore,
			nextCursor: hasMore ? paginationKey ?? null : null,
		};
	} catch (error) {
		logStructError(`getGlobalLeaderboard:${timeframe}`, error);
		return { data: [], hasMore: false, nextCursor: null };
	}
}

function mapCategoryEntry(entry: CategoryEntry): TraderLeaderboardEntry {
	const total_buys = entry.total_buys ?? 0;
	const total_sells = entry.total_sells ?? 0;
	const redeem_count = entry.redeem_count ?? 0;
	const merge_count = entry.merge_count ?? 0;
	const trader = entry.trader ?? { address: "" };

	return {
		trader: {
			address: trader.address,
			name: trader.name ?? null,
			pseudonym: trader.pseudonym ?? null,
			profile_image: trader.profile_image ?? null,
			x_username: trader.x_username ?? null,
			verified_badge: trader.verified_badge ?? false,
		},
		current_pnl: entry.current_pnl,
		realized_pnl_usd: entry.realized_pnl_usd,
		pnl_1d: null,
		pnl_7d: null,
		pnl_30d: null,
		events_traded: 0,
		markets_traded: entry.markets_traded,
		markets_won: entry.markets_won,
		markets_lost: entry.markets_lost,
		market_win_rate_pct: entry.market_win_rate_pct,
		avg_win_usd: entry.avg_win_usd,
		avg_loss_usd: entry.avg_loss_usd,
		profit_factor: entry.profit_factor,
		total_buys,
		total_sells,
		total_redemptions: redeem_count,
		total_merges: merge_count,
		total_volume_usd: entry.total_volume_usd,
		buy_volume_usd: entry.buy_volume_usd,
		sell_volume_usd: entry.sell_volume_usd,
		redemption_volume_usd: entry.redemption_volume_usd,
		merge_volume_usd: entry.merge_volume_usd,
		total_fees: entry.total_fees,
		total_wins_usd: entry.total_wins_usd,
		total_losses_usd: entry.total_losses_usd,
		best_market_pnl_usd: entry.best_market_pnl_usd ?? null,
		worst_market_pnl_usd: entry.worst_market_pnl_usd ?? null,
		avg_hold_time_seconds: entry.avg_hold_time_seconds,
		first_trade_at: entry.first_trade_at ?? null,
		last_trade_at: entry.last_trade_at ?? null,
		maker_rebate_count: 0,
		maker_rebate_usd: 0,
		reward_count: 0,
		reward_usd: 0,
		yield_count: 0,
		yield_usd: 0,
		total_credit_count: 0,
		total_credit_usd: 0,
		total_trades: total_buys + total_sells + redeem_count + merge_count,
	} as TraderLeaderboardEntry;
}

export async function getCategoryLeaderboard(
	category: PolymarketCategory,
	timeframe: string = "lifetime",
	limit: number = MAX_LEADERBOARD_PAGE_SIZE,
	cursor?: string,
	sort?: LeaderboardSortOptions,
): Promise<PaginatedResult<TraderLeaderboardEntry>> {
	const client = getStructClient();

	if (!client) {
		return { data: [], hasMore: false, nextCursor: null };
	}

	const tf = timeframe as "1d" | "7d" | "30d" | "lifetime";
	const sortBy = (sort?.sortBy ?? "realized_pnl_usd") as Parameters<typeof client.tags.getCategoryTopTradersV3>[0]["sort_by"];
	const sortDirection = sort?.sortDirection ?? "desc";
	const data: TraderLeaderboardEntry[] = [];
	let paginationKey: string | undefined = cursor;
	let hasMore = false;

	try {
		let requestsMade = 0;

		while (data.length < limit) {
			if (requestsMade >= maxPaginationRequests) {
				logPaginationLimitReached("getCategoryLeaderboard");
				hasMore = false;
				break;
			}

			const chunkLimit = Math.min(MAX_CATEGORY_LEADERBOARD_PAGE_SIZE, limit - data.length);
			const response = await client.tags.getCategoryTopTradersV3({
				category,
				timeframe: tf,
				sort_by: sortBy,
				sort_direction: sortDirection,
				limit: chunkLimit,
				pagination_key: paginationKey,
			});
			requestsMade += 1;
			const chunk = response.data ?? [];
			for (const entry of chunk) {
				data.push(mapCategoryEntry(entry));
			}
			const nextKey = response.pagination?.pagination_key;
			const responseHasMore = response.pagination?.has_more ?? false;
			paginationKey = typeof nextKey === "string" && nextKey.length > 0 ? nextKey : undefined;
			if (!responseHasMore || !paginationKey || chunk.length < chunkLimit) {
				hasMore = responseHasMore && Boolean(paginationKey);
				break;
			}
			hasMore = true;
		}

		return {
			data,
			hasMore,
			nextCursor: hasMore ? paginationKey ?? null : null,
		};
	} catch (error) {
		logStructError(`getCategoryLeaderboard:${category}:${timeframe}`, error);
		return { data: [], hasMore: false, nextCursor: null };
	}
}
