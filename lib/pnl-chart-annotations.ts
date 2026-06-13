import type { PnlChartAnnotation, PnlDataPoint, PnlPeriodWindow, PnlPeriods } from "@/lib/struct/pnl";

export function getPnlChartAnnotations(
	candles: PnlDataPoint[],
	periods: PnlPeriods,
): PnlChartAnnotation[] {
	if (candles.length === 0) return [];

	const sortedCandles = [...candles].sort((a, b) => a.t - b.t);

	function findCumulativePnlAt(timestamp: number): number | null {
		let candidate: PnlDataPoint | null = null;
		for (const candle of sortedCandles) {
			if (candle.t > timestamp) break;
			candidate = candle;
		}
		return candidate?.p ?? null;
	}

	const annotations: PnlChartAnnotation[] = [];
	const windows: PnlPeriodWindow[] = ["day", "week", "month"];

	for (const window of windows) {
		const extremes = periods.totalPnl[window];
		for (const kind of ["best", "worst"] as const) {
			const period = extremes[kind];
			if (!period) continue;
			if (kind === "best" && period.change <= 0) continue;
			if (kind === "worst" && period.change >= 0) continue;

			const cumulativePnl = findCumulativePnlAt(period.from);
			if (cumulativePnl === null) continue;

			annotations.push({
				kind,
				window,
				date: period.date,
				change: period.change,
				from: period.from,
				to: period.to,
				p: cumulativePnl,
			});
		}
	}

	annotations.sort((a, b) => a.from - b.from);
	return annotations;
}
