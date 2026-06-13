import type { PnlAnchor, PnlTimeframe } from "@/lib/struct/pnl-timeframes";
import { formatDateCompact } from "@/lib/format";

const TIMEFRAME_LABELS: Record<PnlTimeframe, string> = {
	"1d": "Last 24h",
	"1w": "Last 7 days",
	"1m": "Last 30 days",
	all: "All time",
};

const ANCHOR_LABELS: Record<PnlAnchor, string> = {
	day: "Today",
	week: "This week",
	month: "This month",
	year: "This year",
};

export type RangeLabelInput = {
	mode: "preset" | "anchor" | "custom";
	timeframe: PnlTimeframe;
	anchor: PnlAnchor | null;
	from: number | undefined;
	to: number | undefined;
	timezone: string;
};

export function pnlRangeChipLabel(input: RangeLabelInput): string {
	if (input.mode === "anchor" && input.anchor) {
		return ANCHOR_LABELS[input.anchor];
	}
	if (input.mode === "custom" && input.from !== undefined && input.to !== undefined) {
		const from = formatDateCompact(input.from, input.timezone);
		const to = formatDateCompact(input.to, input.timezone);
		return from === to ? from : `${from} – ${to}`;
	}
	return TIMEFRAME_LABELS[input.timeframe];
}

export { TIMEFRAME_LABELS, ANCHOR_LABELS };
