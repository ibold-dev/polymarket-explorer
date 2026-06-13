"use client";

import type { PositionChartOutcome } from "@structbuild/sdk";
import posthog from "posthog-js";
import { useCallback, useRef, useState, useTransition } from "react";

import { getMarketPositionVolumeAction } from "@/app/actions";
import { MarketProbabilityChartClient } from "@/components/market/market-probability-chart-client";
import {
	MarketVolumeChartClient,
	type VolumeOutcome,
	type VolumeOutcomeOption,
} from "@/components/market/market-volume-chart-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
	outcomes: PositionChartOutcome[] | null;
	volumeOptions: VolumeOutcomeOption[];
	initialVolume: VolumeOutcome | null;
};

export function MarketChartsClient({ outcomes, volumeOptions, initialVolume }: Props) {
	const defaultTab = outcomes ? "price" : "volume";
	const [tab, setTab] = useState(defaultTab);
	const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState(
		initialVolume?.outcomeIndex ?? volumeOptions[0]?.outcomeIndex ?? 0,
	);
	const [volume, setVolume] = useState<VolumeOutcome | null>(initialVolume);
	const [loadedOutcomeIndex, setLoadedOutcomeIndex] = useState<number | null>(
		initialVolume?.outcomeIndex ?? null,
	);
	const [isPending, startTransition] = useTransition();
	const requestIdRef = useRef(0);
	const pendingOutcomeIndexRef = useRef<number | null>(null);

	const loadVolume = useCallback((outcomeIndex: number) => {
		if (loadedOutcomeIndex === outcomeIndex || pendingOutcomeIndexRef.current === outcomeIndex) return;
		const option = volumeOptions.find((candidate) => candidate.outcomeIndex === outcomeIndex);
		if (!option) return;
		setSelectedOutcomeIndex(outcomeIndex);
		pendingOutcomeIndexRef.current = outcomeIndex;
		const requestId = requestIdRef.current + 1;
		requestIdRef.current = requestId;

		startTransition(async () => {
			const result = await getMarketPositionVolumeAction(option);
			if (requestIdRef.current !== requestId) return;
			setVolume(result);
			setLoadedOutcomeIndex(outcomeIndex);
			pendingOutcomeIndexRef.current = null;
		});
	}, [loadedOutcomeIndex, volumeOptions]);

	const title = tab === "price" ? "Price Chart" : "Volume Chart";

	return (
		<section className="rounded-lg bg-card p-4 sm:p-6">
			<Tabs
				value={tab}
				onValueChange={(value) => {
					const next = String(value);
					if (next === tab) return;
					posthog.capture("market_chart_tab_changed", { tab: next, previous_tab: tab });
					setTab(next);
					if (next === "volume") loadVolume(selectedOutcomeIndex);
				}}
			>
				<div className="mb-4 flex items-center justify-between gap-3">
					<h2 className="text-base font-medium text-foreground">{title}</h2>
					<TabsList>
						{outcomes && <TabsTrigger value="price">Price</TabsTrigger>}
						{volumeOptions.length > 0 && <TabsTrigger value="volume">Volume</TabsTrigger>}
					</TabsList>
				</div>
				{outcomes && (
					<TabsContent value="price"><MarketProbabilityChartClient outcomes={outcomes} /></TabsContent>
				)}
				{volumeOptions.length > 0 && (
					<TabsContent value="volume">
						<MarketVolumeChartClient
							outcomes={volume ? [volume] : []}
							options={volumeOptions}
							selectedOutcomeIndex={selectedOutcomeIndex}
							onOutcomeChange={loadVolume}
							loading={isPending}
						/>
					</TabsContent>
				)}
			</Tabs>
		</section>
	);
}
