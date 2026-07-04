import "server-only";

import type { Trade } from "@/lib/polymarket/types";

import { getPolymarketClient } from "@/lib/polymarket/client";
import { logStructError, readStatus } from "@/lib/polymarket/http";
import { emptyOffsetPage } from "@/lib/polymarket/queries/_shared";
import type { PaginatedResource } from "@/lib/polymarket/types";

export const defaultMarketTradesPageSize = 25;

export type GetMarketTradesRequest = NonNullable<Parameters<any["markets"]["getTrades"]>[0]>;
export type MarketTradesPageOptions = { limit?: number; offset?: number; sort_desc?: boolean; trade_types?: string[];[key: string]: any };

export async function getMarketTradesPage(
	conditionId: string,
	options?: MarketTradesPageOptions,
): Promise<PaginatedResource<Trade, number>> {
	const client = getPolymarketClient();
	const limit = options?.limit ?? defaultMarketTradesPageSize;

	if (!client) {
		return emptyOffsetPage<Trade>(limit);
	}

	const offset = options?.offset ?? 0;
	const { sort_desc, trade_types, ...restOptions } = (options ?? {}) as MarketTradesPageOptions;

	try {
		const response = await client.newClient.markets.getTrades({
			condition_ids: conditionId,
			...restOptions,
			limit: limit + 1,
			offset,
			sort_desc: sort_desc ?? true,
			trade_types: trade_types ?? "OrderFilled,OrdersMatched",
		});
		const data = response.data.slice(0, limit);
		const hasMore = response.data.length > limit;
		const nextCursor = hasMore ? offset + data.length : null;

		return {
			data,
			hasMore,
			nextCursor,
			pageSize: limit,
		};
	} catch (error) {
		if (readStatus(error) === 404) {
			return emptyOffsetPage<Trade>(limit);
		}

		logStructError(`getMarketTradesPage:${conditionId}`, error);
		return emptyOffsetPage<Trade>(limit);
	}
}

export const defaultEventTradesLimit = 50;

export async function getEventTrades(
	conditionIds: string[],
	limit: number = defaultEventTradesLimit,
): Promise<Trade[]> {
	const client = getPolymarketClient();
	const filtered = conditionIds.filter((id): id is string => Boolean(id));

	if (!client || filtered.length === 0) {
		return [];
	}

	try {
		const response = await client.newClient.markets.getTrades({
			condition_ids: filtered.join(","),
			limit,
			sort_desc: true,
			trade_types: "OrderFilled,OrdersMatched",
		});
		return response.data;
	} catch (error) {
		if (readStatus(error) === 404) {
			return [];
		}

		logStructError(`getEventTrades:${filtered.length}`, error);
		return [];
	}
}

export async function getRecentTrades(limit: number = 10): Promise<Trade[]> {
	const client = getPolymarketClient();

	if (!client) {
		return [];
	}

	try {
		const response = await client.newClient.markets.getTrades({
			limit,
			sort_desc: true,
			trade_types: "OrderFilled,OrdersMatched",
		});
		return response.data;
	} catch (error) {
		logStructError("getRecentTrades", error);
		return [];
	}
}
