"use client";

import type { MarketEntry, PositionEntry, TraderInfo } from "@structbuild/sdk";
import { useCallback, useState, useTransition } from "react";

import { getMarketPositionTopTradersAction } from "@/app/actions";
import { TraderTableCell } from "@/components/trader/trader-table-cell";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume } from "@/components/ui/volume";
import { formatNumber, pnlColorClass } from "@/lib/format";
import { cn, normalizeWalletAddress } from "@/lib/utils";

type OutcomeOption = { position_id: string; name: string };

type MarketTopTradersRow = (MarketEntry | PositionEntry) & {
	trader: TraderInfo;
};

const ALL_VALUE = "__all__";

export function MarketTopTradersClient({
	outcomes,
	initialTraders,
}: {
	outcomes: OutcomeOption[];
	initialTraders: MarketEntry[];
}) {
	const [activeValue, setActiveValue] = useState<string>(ALL_VALUE);
	const [rows, setRows] = useState<MarketTopTradersRow[]>(initialTraders as unknown as MarketTopTradersRow[]);
	const [isPending, startTransition] = useTransition();

	const handleChange = useCallback((next: string) => {
		if (next === activeValue) return;
		setActiveValue(next);

		if (next === ALL_VALUE) {
			setRows(initialTraders as unknown as MarketTopTradersRow[]);
			return;
		}

		startTransition(async () => {
			const result = await getMarketPositionTopTradersAction({ positionId: next });
			setRows(result.traders as unknown as MarketTopTradersRow[]);
		});
	}, [activeValue, initialTraders]);

	const outcomePicker = (
		<Tabs value={activeValue} onValueChange={(value) => handleChange(String(value))}>
			<TabsList>
				<TabsTrigger value={ALL_VALUE}>All</TabsTrigger>
				{outcomes.map((o) => (
					<TabsTrigger key={o.position_id} value={o.position_id}>
						{o.name}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);

	return (
		<div className="space-y-4">
			{outcomes.length > 0 ? outcomePicker : null}
			<div
				className={cn(
					"overflow-hidden rounded-lg border bg-card",
					isPending && "opacity-70",
				)}
				aria-busy={isPending}
			>
				{rows.length === 0 ? (
					<p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-6">
						No traders yet for this outcome.
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12">#</TableHead>
								<TableHead>Trader</TableHead>
								<TableHead className="text-right">Realized PnL</TableHead>
								<TableHead className="text-right">Volume</TableHead>
								<TableHead className="text-right">Shares</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row, index) => {
								const address = normalizeWalletAddress(row.trader.address) ?? row.trader.address;
								const pnl = row.realized_pnl_usd ?? 0;
								const volumeUsd =
									"total_volume_usd" in row && typeof row.total_volume_usd === "number"
										? row.total_volume_usd
										: (("total_buy_usd" in row ? row.total_buy_usd : null) ?? 0)
											+ (("total_sell_usd" in row ? row.total_sell_usd : null) ?? 0);

								return (
									<TableRow key={`${address}-${index}`}>
										<TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
										<TableCell>
											<TraderTableCell trader={row.trader} />
										</TableCell>
										<TableCell className={cn("text-right font-medium tabular-nums", pnlColorClass(pnl))}>
											{formatNumber(pnl, { currency: true, compact: true })}
										</TableCell>
										<TableCell className="text-right">
											<Volume usd={volumeUsd} shares={null} className="tabular-nums" />
										</TableCell>
										<TableCell className="text-right tabular-nums">
											{formatNumber(row.current_shares_balance ?? 0, { decimals: 0 })}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}
