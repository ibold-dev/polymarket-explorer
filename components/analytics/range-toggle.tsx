"use client";

import { AnalyticsUrlToggle, type AnalyticsNavigateHandler } from "@/components/analytics/url-toggle";
import {
	ANALYTICS_RANGES,
	ANALYTICS_RANGE_DESCRIPTIONS,
	ANALYTICS_RANGE_LABELS,
	DEFAULT_ANALYTICS_RANGE,
	type AnalyticsRange,
} from "@/lib/struct/analytics-shared";

export function AnalyticsRangeToggle({
	range,
	defaultRange = DEFAULT_ANALYTICS_RANGE,
	pending,
	onNavigate,
}: {
	range: AnalyticsRange;
	defaultRange?: AnalyticsRange;
	pending?: boolean;
	onNavigate?: AnalyticsNavigateHandler<AnalyticsRange>;
}) {
	return (
		<AnalyticsUrlToggle
			paramKey="range"
			value={range}
			options={ANALYTICS_RANGES}
			labels={ANALYTICS_RANGE_LABELS}
			descriptions={ANALYTICS_RANGE_DESCRIPTIONS}
			defaultValue={defaultRange}
			pending={pending}
			onNavigate={onNavigate}
			transformParams={(params) => {
				params.delete("resolution");
			}}
		/>
	);
}
