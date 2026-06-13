"use client";

import { AnalyticsUrlToggle, type AnalyticsNavigateHandler } from "@/components/analytics/url-toggle";
import {
	ANALYTICS_VIEWS,
	ANALYTICS_VIEW_DESCRIPTIONS,
	ANALYTICS_VIEW_LABELS,
	DEFAULT_ANALYTICS_VIEW,
	type AnalyticsView,
} from "@/lib/struct/analytics-shared";

export function AnalyticsViewToggle({
	view,
	pending,
	onNavigate,
}: {
	view: AnalyticsView;
	pending?: boolean;
	onNavigate?: AnalyticsNavigateHandler<AnalyticsView>;
}) {
	return (
		<AnalyticsUrlToggle
			paramKey="view"
			value={view}
			options={ANALYTICS_VIEWS}
			labels={ANALYTICS_VIEW_LABELS}
			descriptions={ANALYTICS_VIEW_DESCRIPTIONS}
			defaultValue={DEFAULT_ANALYTICS_VIEW}
			pending={pending}
			onNavigate={onNavigate}
			transformParams={(params, next) => {
				if (next === "cumulative") params.delete("range");
			}}
		/>
	);
}
