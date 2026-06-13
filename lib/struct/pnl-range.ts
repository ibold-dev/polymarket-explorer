import { tz } from "@date-fns/tz";
import { startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";

import {
	PNL_TIMEFRAMES,
	pickPnlResolutionForSpan,
	pickPnlResolutionForTz,
	type PnlAnchor,
	type PnlTimeframe,
	type StructPnlCandleResolution,
	type StructPnlCandleTimeframe,
} from "@/lib/struct/pnl-timeframes";

const DEFAULT_TIMEZONE = "UTC";

export type PnlRangeInput = {
	timeframe: PnlTimeframe;
	anchor: PnlAnchor | null;
	from: number | null;
	to: number | null;
	tz: string | null;
};

export type PnlRangeMode = "preset" | "anchor" | "custom";

export type ResolvedPnlRange = {
	mode: PnlRangeMode;
	timeframe: PnlTimeframe;
	anchor: PnlAnchor | null;
	from: number | undefined;
	to: number | undefined;
	timezone: string;
	apiTimeframe: StructPnlCandleTimeframe;
	resolution: StructPnlCandleResolution;
};

function anchorStartSeconds(anchor: PnlAnchor, now: Date, timezone: string): number {
	const inTz = tz(timezone);
	const ctx = { in: inTz };
	switch (anchor) {
		case "day":
			return Math.floor(startOfDay(now, ctx).getTime() / 1000);
		case "week":
			return Math.floor(startOfWeek(now, { ...ctx, weekStartsOn: 1 }).getTime() / 1000);
		case "month":
			return Math.floor(startOfMonth(now, ctx).getTime() / 1000);
		case "year":
			return Math.floor(startOfYear(now, ctx).getTime() / 1000);
	}
}

export function resolvePnlRange(input: PnlRangeInput, nowSeconds = Math.floor(Date.now() / 1000)): ResolvedPnlRange {
	const timezone = input.tz ?? DEFAULT_TIMEZONE;
	const now = new Date(nowSeconds * 1000);

	if (input.from !== null && input.to !== null && input.from < input.to) {
		const span = input.to - input.from;
		const baseResolution = pickPnlResolutionForSpan(span);
		const resolution = pickPnlResolutionForTz(baseResolution, timezone, span);
		return {
			mode: "custom",
			timeframe: input.timeframe,
			anchor: input.anchor,
			from: input.from,
			to: input.to,
			timezone,
			apiTimeframe: "lifetime",
			resolution,
		};
	}

	if (input.anchor) {
		const from = anchorStartSeconds(input.anchor, now, timezone);
		const span = Math.max(nowSeconds - from, 1);
		const baseResolution = pickPnlResolutionForSpan(span);
		const resolution = pickPnlResolutionForTz(baseResolution, timezone, span);
		return {
			mode: "anchor",
			timeframe: input.timeframe,
			anchor: input.anchor,
			from,
			to: nowSeconds,
			timezone,
			apiTimeframe: "lifetime",
			resolution,
		};
	}

	const { timeframe: apiTimeframe, resolution } = PNL_TIMEFRAMES[input.timeframe];
	return {
		mode: "preset",
		timeframe: input.timeframe,
		anchor: null,
		from: undefined,
		to: undefined,
		timezone,
		apiTimeframe,
		resolution,
	};
}
