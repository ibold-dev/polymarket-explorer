export const TRADER_LEADERBOARD_SORT_KEYS = [
	"realized_pnl_usd",
	"total_volume_usd",
	"buy_volume_usd",
	"sell_volume_usd",
	"redemption_volume_usd",
	"merge_volume_usd",
	"total_fees",
	"total_buys",
	"total_sells",
	"total_redemptions",
	"total_merges",
	"events_traded",
	"markets_traded",
	"markets_won",
	"markets_lost",
	"market_win_rate_pct",
	"avg_win_usd",
	"avg_loss_usd",
	"profit_factor",
	"total_wins_usd",
	"total_losses_usd",
	"best_win",
	"worst_loss",
	"avg_hold_time_seconds",
	"first_trade_at",
	"last_trade_at",
	"maker_rebate_count",
	"maker_rebate_usd",
	"reward_count",
	"reward_usd",
	"yield_count",
	"yield_usd",
] as const;

export type TraderLeaderboardSortKey = (typeof TRADER_LEADERBOARD_SORT_KEYS)[number];

export const TRADER_LEADERBOARD_SORT_DIRECTIONS = ["asc", "desc"] as const;
export type TraderLeaderboardSortDirection = (typeof TRADER_LEADERBOARD_SORT_DIRECTIONS)[number];

export const DEFAULT_TRADER_LEADERBOARD_SORT: TraderLeaderboardSortKey = "realized_pnl_usd";
export const DEFAULT_TRADER_LEADERBOARD_SORT_DIRECTION: TraderLeaderboardSortDirection = "desc";

export type LeaderboardScope = "global" | "category";

const CATEGORY_SORT_OVERRIDES: Partial<Record<TraderLeaderboardSortKey, string>> = {
	total_redemptions: "redeem_count",
	total_merges: "merge_count",
};

const CATEGORY_UNSUPPORTED_SORTS = new Set<TraderLeaderboardSortKey>([
	"events_traded",
	"maker_rebate_count",
	"maker_rebate_usd",
	"reward_count",
	"reward_usd",
	"yield_count",
	"yield_usd",
]);

export function isLeaderboardSortSupported(
	sortKey: TraderLeaderboardSortKey,
	scope: LeaderboardScope,
): boolean {
	if (scope === "category" && CATEGORY_UNSUPPORTED_SORTS.has(sortKey)) return false;
	return true;
}

export function parseTraderLeaderboardSort(
	value: string | string[] | undefined,
	scope: LeaderboardScope,
): TraderLeaderboardSortKey {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw && (TRADER_LEADERBOARD_SORT_KEYS as readonly string[]).includes(raw)) {
		const key = raw as TraderLeaderboardSortKey;
		if (isLeaderboardSortSupported(key, scope)) return key;
	}
	return DEFAULT_TRADER_LEADERBOARD_SORT;
}

export function parseTraderLeaderboardSortDirection(
	value: string | string[] | undefined,
): TraderLeaderboardSortDirection {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw === "asc" || raw === "desc") return raw;
	return DEFAULT_TRADER_LEADERBOARD_SORT_DIRECTION;
}

export function resolveLeaderboardSortField(
	sort: TraderLeaderboardSortKey,
	scope: LeaderboardScope,
): string {
	if (sort === "best_win") return scope === "category" ? "best_market_pnl_usd" : "best_trade_pnl_usd";
	if (sort === "worst_loss") return scope === "category" ? "worst_market_pnl_usd" : "worst_trade_pnl_usd";
	if (scope === "category" && CATEGORY_SORT_OVERRIDES[sort]) {
		return CATEGORY_SORT_OVERRIDES[sort] as string;
	}
	return sort;
}
