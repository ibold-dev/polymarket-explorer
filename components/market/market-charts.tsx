import { ChartCard } from "@/components/market/chart-card";
import { MarketChartsClient } from "@/components/market/market-charts-client";
import type { VolumeOutcome } from "@/components/market/market-volume-chart-client";
import {
	getMarketChart,
	getPositionVolumeChart,
	toVolumePoints,
} from "@/lib/struct/market-queries";

export async function MarketCharts({ conditionId }: { conditionId: string }) {
	const outcomes = await getMarketChart(conditionId);

	const hasPrice = !!outcomes?.length && outcomes.some((o) => o.data.length > 1);

	if (!outcomes?.length) {
		return null;
	}

	const firstOutcome = outcomes[0];
	let initialVolume: VolumeOutcome | null = null;
	if (!hasPrice && firstOutcome) {
		try {
			const points = await getPositionVolumeChart(firstOutcome.position_id);
			initialVolume = {
				name: firstOutcome.name,
				outcomeIndex: firstOutcome.outcome_index,
				data: toVolumePoints(points),
			};
		} catch {
			initialVolume = {
				name: firstOutcome.name,
				outcomeIndex: firstOutcome.outcome_index,
				data: [],
			};
		}
	}

	return (
		<MarketChartsClient
			outcomes={hasPrice ? outcomes : null}
			initialVolume={initialVolume}
			volumeOptions={outcomes.map((outcome) => ({
				name: outcome.name,
				outcomeIndex: outcome.outcome_index,
				positionId: outcome.position_id,
			}))}
		/>
	);
}

export function MarketChartsFallback() {
	return (
		<ChartCard title="Activity">
			<div className="h-[260px] animate-pulse rounded-md bg-muted/60 sm:h-[320px]" />
		</ChartCard>
	);
}
