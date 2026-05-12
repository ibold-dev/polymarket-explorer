import "server-only";

import type {
	GlobalEntry,
	HolderHistoryCandle,
	MarketHoldersResponse,
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

export type TraderLeaderboardEntry = Omit<GlobalEntry, "trader"> & {
	trader: TraderInfo;
	total_trades: number;
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

export async function getGlobalLeaderboard(
	timeframe: string = "lifetime",
	limit: number = MAX_LEADERBOARD_PAGE_SIZE,
	cursor?: string,
): Promise<PaginatedResult<TraderLeaderboardEntry>> {
	const client = getStructClient();

	if (!client) {
		return { data: [], hasMore: false, nextCursor: null };
	}

	const tf = timeframe as "1d" | "7d" | "30d" | "lifetime";
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
				sort_by: "realized_pnl_usd",
				sort_direction: "desc",
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
