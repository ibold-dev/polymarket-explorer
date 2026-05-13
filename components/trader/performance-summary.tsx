import Image from "next/image";
import { InfoRow } from "@/components/trader/info-row";
import { PeriodRows } from "@/components/trader/period-rows";
import { Separator } from "@/components/ui/separator";
import type { PnlPeriods, PnlStreaks } from "@/lib/struct/pnl";
import { formatDuration, formatNumber } from "@/lib/format";
import { normalizePolymarketS3ImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import type { PnlV3ChangesResponse, PnlV3RiskResponse, GlobalEntry } from "@structbuild/sdk";

type PerformanceSummaryProps = {
	pnlSummary: GlobalEntry | null;
	pnlRisk?: PnlV3RiskResponse | null;
	pnlChanges?: PnlV3ChangesResponse | null;
	streaks: PnlStreaks;
	periods: PnlPeriods;
};

const PNL_CHANGE_WINDOWS = ["1d", "7d", "30d"] as const;

function PnlChangeBadges({ changes }: { changes: PnlV3ChangesResponse["changes"] | undefined }) {
	const byTimeframe = new Map(changes?.map((window) => [window.timeframe, window]) ?? []);

	return (
		<div className="grid grid-cols-3 gap-2 text-sm font-medium">
			{PNL_CHANGE_WINDOWS.map((window) => {
				const entry = byTimeframe.get(window);
				const change = entry?.total_pnl_change ?? null;
				const colorClass = change == null
					? "text-muted-foreground"
					: change > 0
						? "text-emerald-500"
						: change < 0
							? "text-red-500"
							: "text-foreground";

				return (
					<span key={window} className="min-w-0 whitespace-nowrap">
						<span className="text-muted-foreground">{window.toUpperCase()} </span>
						{change == null ? (
							<span className="text-muted-foreground">—</span>
						) : (
							<span className={cn(colorClass, "tabular-nums")}>
								{formatNumber(change, { currency: true, compact: true })}
							</span>
						)}
					</span>
				);
			})}
		</div>
	);
}

function RiskValue({
	value,
	pct,
	tone,
	invert = false,
}: {
	value: number | null | undefined;
	pct?: number | null;
	tone: "positive" | "negative";
	invert?: boolean;
}) {
	if (value == null) return <span className="text-muted-foreground">—</span>;

	const signedValue = invert && value !== 0 ? -Math.abs(value) : value;
	const signedPct = pct == null ? null : invert && pct !== 0 ? -Math.abs(pct) : pct;
	const colorClassName = tone === "positive" ? "text-emerald-500" : "text-red-500";

	return (
		<>
			<span className={colorClassName}>{formatNumber(signedValue, { currency: true, compact: true })}</span>
			{signedPct != null && <span className="font-normal text-muted-foreground"> ({formatNumber(signedPct, { percent: true })})</span>}
		</>
	);
}

function TradingStatsGrid({ pnlSummary }: { pnlSummary: GlobalEntry | null }) {
	const stats = [
		{ label: "Events", value: pnlSummary?.events_traded ?? 0 },
		{ label: "Markets", value: pnlSummary?.markets_traded ?? 0 },
		{ label: "Won", value: pnlSummary?.markets_won ?? 0, className: "text-emerald-500" },
		{ label: "Lost", value: pnlSummary?.markets_lost ?? 0, className: "text-red-500" },
	];

	return (
		<div>
			<div className="grid grid-cols-4 gap-2">
				{stats.map((stat) => (
					<div key={stat.label} className="min-w-0">
						<p className="truncate text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
						<p className={`mt-0.5 truncate text-sm font-medium tabular-nums sm:text-base ${stat.className ?? "text-foreground"}`}>
							{stat.value}
						</p>
					</div>
				))}
			</div>
			<Separator className="my-2 sm:my-3" />
		</div>
	);
}

type TradeHighlight = NonNullable<GlobalEntry["best_trade_metadata"]>;

function TradeHighlightRow({
	label,
	pnl,
	metadata,
	tone,
}: {
	label: string;
	pnl: number | null | undefined;
	metadata: TradeHighlight | null | undefined;
	tone: "positive" | "negative";
}) {
	const hasTrade = tone === "positive" ? (pnl ?? 0) > 0 : (pnl ?? 0) < 0;
	const valueColor = tone === "positive" ? "text-emerald-500" : "text-red-500";
	const imageUrl = normalizePolymarketS3ImageUrl(metadata?.image_url);

	return (
		<div>
			<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
				<p className="text-sm text-foreground/90 sm:text-base">{label}</p>
				{!hasTrade ? (
					<span className="text-sm font-medium text-muted-foreground sm:text-base">—</span>
				) : (
					<div className="flex min-w-0 items-center gap-1.5 sm:justify-end">
						{imageUrl && (
							<Image
								src={imageUrl}
								alt={metadata?.question ?? metadata?.title ?? ""}
								width={16}
								height={16}
								className="size-4 rounded-sm object-cover"
							/>
						)}
						<p className={cn("text-sm font-medium sm:text-base", valueColor)}>
							{formatNumber(pnl ?? 0, { currency: true, compact: true })}
						</p>
					</div>
				)}
			</div>
			{hasTrade && (metadata?.question || metadata?.title) && (
				<p className="mt-1 text-sm text-muted-foreground break-words sm:truncate">{metadata?.question ?? metadata?.title}</p>
			)}
			<Separator className="my-2" />
		</div>
	);
}

export function PerformanceSummary({ pnlSummary, pnlRisk, pnlChanges, streaks, periods }: PerformanceSummaryProps) {
	const totalPnlRisk = pnlRisk?.total_pnl ?? null;

	return (
		<div className="rounded-lg bg-card p-4 sm:p-6">
			<p className="text-sm text-foreground sm:text-base">Performance Summary</p>
			<Separator className="my-2" />
			<div>
				<p className="text-sm text-foreground/90 sm:text-base">PnL Change</p>
				<div className="mt-1">
					<PnlChangeBadges changes={pnlChanges?.changes} />
				</div>
				<Separator className="my-2 sm:my-3" />
			</div>
			<TradingStatsGrid pnlSummary={pnlSummary} />
			<InfoRow label="Avg. Hold Time" value={formatDuration(pnlSummary?.avg_hold_time_seconds ?? 0)} />
			<TradeHighlightRow
				label="Best Win"
				pnl={pnlSummary?.best_trade_pnl_usd}
				metadata={pnlSummary?.best_trade_metadata}
				tone="positive"
			/>
			<TradeHighlightRow
				label="Worst Loss"
				pnl={pnlSummary?.worst_trade_pnl_usd}
				metadata={pnlSummary?.worst_trade_metadata}
				tone="negative"
			/>
			<PeriodRows periods={periods} />
			<Separator className="my-2 sm:my-3" />
			<InfoRow label="Longest Win Streak" value={`${streaks.longestWin}d`} />
			<InfoRow label="Longest Loss Streak" value={`${streaks.longestLoss}d`} />
			<InfoRow
				label="Max Drawdown"
				value={
					<RiskValue
						value={totalPnlRisk?.max_drawdown}
						pct={totalPnlRisk?.max_drawdown_pct}
						tone="negative"
						invert
					/>
				}
			/>
			<InfoRow
				label="Current Drawdown"
				value={
					<RiskValue
						value={totalPnlRisk?.current_drawdown}
						pct={totalPnlRisk?.current_drawdown_pct}
						tone="negative"
						invert
					/>
				}
			/>
			<InfoRow
				label="Max Runup"
				value={
					<RiskValue
						value={totalPnlRisk?.max_runup}
						pct={totalPnlRisk?.max_runup_pct}
						tone="positive"
					/>
				}
			/>
			<InfoRow
				label="Current Streak"
				value={`${Math.abs(streaks.current)}d ${streaks.current > 0 ? "W" : streaks.current < 0 ? "L" : ""}`}
				separator={false}
			/>
		</div>
	);
}
