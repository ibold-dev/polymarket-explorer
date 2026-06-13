import type { PolymarketCategory } from "@structbuild/sdk";

import { PaginationNav } from "@/components/seo/pagination-nav";
import { TradersTable } from "@/components/trader/traders-table";
import { TradersTimeframeToggle } from "@/components/trader/traders-timeframe-toggle";
import { getCategoryLeaderboard } from "@/lib/struct/market-queries";
import {
	resolveLeaderboardSortField,
	type TraderLeaderboardSortDirection,
	type TraderLeaderboardSortKey,
} from "@/lib/trader-leaderboard-sort";
import type { TraderTimeframe } from "@/lib/trader-timeframes";

const PAGE_SIZE = 25;

export async function TagTopTradersListing({
	category,
	timeframe,
	sort,
	direction,
	cursor,
	page,
	basePath,
	baseParams,
	toolbarLeft,
}: {
	category: PolymarketCategory;
	timeframe: TraderTimeframe;
	sort: TraderLeaderboardSortKey;
	direction: TraderLeaderboardSortDirection;
	cursor: string | null;
	page: number;
	basePath: string;
	baseParams: Record<string, string>;
	toolbarLeft?: React.ReactNode;
}) {
	const { data: traders, hasMore, nextCursor } = await getCategoryLeaderboard(
		category,
		timeframe,
		PAGE_SIZE,
		cursor ?? undefined,
		{ sortBy: resolveLeaderboardSortField(sort, "category"), sortDirection: direction },
	);

	return (
		<div className="space-y-4">
			<TradersTable
				traders={traders}
				rankOffset={(page - 1) * PAGE_SIZE}
				scope="category"
				sort={sort}
				direction={direction}
				toolbarLeft={toolbarLeft}
				toolbarRight={<TradersTimeframeToggle timeframe={timeframe} />}
			/>
			<PaginationNav
				basePath={basePath}
				baseParams={baseParams}
				page={page}
				cursor={cursor}
				nextCursor={nextCursor}
				hasMore={hasMore}
			/>
		</div>
	);
}
