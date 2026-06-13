"use client";

import { useMemo, useState, type ReactNode } from "react";
import posthog from "posthog-js";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDateCompact, formatDateFull, formatNumber } from "@/lib/format";

type VolumePoint = { t: number; buy: number; sell: number };

export type VolumeOutcome = {
	name: string;
	outcomeIndex: number;
	data: VolumePoint[];
};

export type VolumeOutcomeOption = {
	name: string;
	outcomeIndex: number;
	positionId: string;
};

type SeriesKey = "total" | "buy" | "sell";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
	{ key: "total", label: "Total", color: "var(--chart-2)" },
	{ key: "buy", label: "Buys", color: "#10b981" },
	{ key: "sell", label: "Sells", color: "#ef4444" },
];

const OUTCOME_COLORS = [
	"#10b981",
	"#ef4444",
	"var(--chart-2)",
	"var(--chart-4)",
];

const chartConfig = {
	total: { label: "Total", color: "var(--chart-2)" },
	buy: { label: "Buys", color: "#10b981" },
	sell: { label: "Sells", color: "#ef4444" },
} satisfies ChartConfig;

export function MarketVolumeChartClient({
	outcomes,
	options,
	selectedOutcomeIndex,
	onOutcomeChange,
	loading = false,
}: {
	outcomes: VolumeOutcome[];
	options?: VolumeOutcomeOption[];
	selectedOutcomeIndex?: number;
	onOutcomeChange?: (outcomeIndex: number) => void;
	loading?: boolean;
}) {
	if (outcomes.length === 0 && !options?.length) {
		return (
			<div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground sm:h-[320px]">
				No volume data available.
			</div>
		);
	}

	return (
		<MarketVolumeChartClientContent
			outcomes={outcomes}
			options={options}
			selectedOutcomeIndex={selectedOutcomeIndex}
			onOutcomeChange={onOutcomeChange}
			loading={loading}
		/>
	);
}

function MarketVolumeChartClientContent({
	outcomes,
	options,
	selectedOutcomeIndex: controlledOutcomeIndex,
	onOutcomeChange,
	loading,
}: {
	outcomes: VolumeOutcome[];
	options?: VolumeOutcomeOption[];
	selectedOutcomeIndex?: number;
	onOutcomeChange?: (outcomeIndex: number) => void;
	loading: boolean;
}) {
	const availableOptions = useMemo(
		() => options ?? outcomes.map((outcome) => ({ ...outcome, positionId: "" })),
		[options, outcomes],
	);
	const [localOutcomeIndex, setLocalOutcomeIndex] = useState<number>(
		controlledOutcomeIndex ?? availableOptions[0]?.outcomeIndex ?? 0,
	);
	const selectedOutcomeIndex = controlledOutcomeIndex
		?? (availableOptions.some((outcome) => outcome.outcomeIndex === localOutcomeIndex)
			? localOutcomeIndex
			: availableOptions[0]?.outcomeIndex ?? localOutcomeIndex);
	const [selectedSeries, setSelectedSeries] = useState<SeriesKey>("total");

	const activeOutcome = outcomes.find((outcome) => outcome.outcomeIndex === selectedOutcomeIndex) ?? null;

	const chartData = useMemo(
		() =>
				(activeOutcome?.data ?? []).map((p) => ({
				t: p.t,
				total: p.buy + p.sell,
				buy: p.buy,
				sell: p.sell,
			})),
			[activeOutcome],
	);

	const activeSeries = SERIES.find((s) => s.key === selectedSeries) ?? SERIES[0];

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				{availableOptions.length > 1 && (
					<ToggleGroup
						value={[String(selectedOutcomeIndex)]}
						onValueChange={(value) => {
							const next = Array.isArray(value) ? value[0] : value;
							if (next) {
								const picked = availableOptions.find((outcome) => String(outcome.outcomeIndex) === next);
								posthog.capture("market_volume_chart_filter_changed", {
									filter_type: "outcome",
									value: picked?.name ?? next,
								});
								const nextIndex = Number(next);
								if (controlledOutcomeIndex === undefined) setLocalOutcomeIndex(nextIndex);
								onOutcomeChange?.(nextIndex);
							}
						}}
						variant="outline"
						size="sm"
						className="flex-wrap"
					>
						{availableOptions.map((outcome, index) => (
							<ToggleGroupItem
								key={outcome.outcomeIndex}
								value={String(outcome.outcomeIndex)}
								aria-label={outcome.name}
								disabled={loading}
							>
								<span
									className="mr-1.5 inline-block size-2 rounded-full"
									style={{ backgroundColor: OUTCOME_COLORS[index % OUTCOME_COLORS.length] }}
								/>
								{outcome.name}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				)}
				<ToggleGroup
					value={[selectedSeries]}
					onValueChange={(value) => {
						const next = Array.isArray(value) ? value[0] : value;
						if (next) {
							posthog.capture("market_volume_chart_filter_changed", {
								filter_type: "series",
								value: next,
							});
							setSelectedSeries(next as SeriesKey);
						}
					}}
					variant="outline"
					size="sm"
					className="flex-wrap"
				>
					{SERIES.map((s) => (
						<ToggleGroupItem key={s.key} value={s.key} aria-label={s.label}>
							<span className="mr-1.5 inline-block size-2 rounded-full" style={{ backgroundColor: s.color }} />
							{s.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
			{loading ? (
				<div className="h-[260px] animate-pulse rounded-md bg-muted sm:h-[320px]" />
			) : chartData.length === 0 ? (
					<div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground sm:h-[320px]">
						No volume data available.
					</div>
				) : (
				<ChartContainer config={chartConfig} className="h-[260px] min-h-[260px] w-full sm:h-[320px]">
				<BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
					<CartesianGrid stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
					<XAxis
						dataKey="t"
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						tickFormatter={(v: string | number) => formatDateCompact(Number(v))}
						minTickGap={32}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						tickLine={false}
						axisLine={false}
						orientation="right"
						tickMargin={6}
						tickFormatter={(v: string | number) => formatNumber(Number(v), { compact: true, currency: true })}
						tick={{ fontSize: 12 }}
						width={56}
					/>
					<ChartTooltip
						content={
							<ChartTooltipContent
								labelFormatter={(_label: ReactNode, payload: ReadonlyArray<{ payload?: unknown }>) => {
									const entry = payload?.[0]?.payload as { t?: number } | undefined;
									return typeof entry?.t === "number" ? formatDateFull(entry.t) : "";
								}}
								formatter={(
									value: number | string | readonly (number | string)[] | undefined,
									name: number | string | undefined,
								) => (
									<span className="flex w-full items-center justify-between gap-4">
										<span className="text-muted-foreground capitalize">{name}</span>
										<span className="font-mono font-medium tabular-nums">
											{formatNumber(value as number, { currency: true, compact: true })}
										</span>
									</span>
								)}
							/>
						}
					/>
					{selectedSeries === "total" ? (
						<>
							<Bar dataKey="buy" name="Buys" stackId="v" fill="#10b981" />
							<Bar dataKey="sell" name="Sells" stackId="v" fill="#ef4444" radius={[2, 2, 0, 0]} />
						</>
					) : (
						<Bar dataKey={activeSeries.key} name={activeSeries.label} fill={activeSeries.color} radius={[2, 2, 0, 0]} />
					)}
				</BarChart>
				</ChartContainer>
				)}
		</div>
	);
}
