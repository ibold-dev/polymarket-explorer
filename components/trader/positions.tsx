"use client"
/* eslint-disable @next/next/no-img-element */

import type { ColumnDef, VisibilityState } from "@tanstack/react-table"
import type { PositionEntry } from "@structbuild/sdk"
import type { Route } from "next"
import Link from "next/link"
import { ExternalLinkIcon, InfoIcon, RefreshCwIcon } from "lucide-react"
import { type ReactNode, useCallback, useMemo, useState, useTransition } from "react"
import { useQueryStates } from "nuqs"

import { getTraderPositionsPageAction } from "@/app/actions"
import type {
	TraderPositionSortBy,
	TraderSortDirection,
} from "@/lib/trader-search-params-shared"
import type { PaginatedResource } from "@/lib/struct/types"
import { traderSearchParamParsers } from "@/lib/trader-search-params"
import { maxTraderPageNumber } from "@/lib/trader-search-params-shared"

import { Badge } from "../ui/badge"
import { DataTable } from "../ui/data-table"
import { SortableHeader } from "../ui/sortable-header"
import { TooltipWrapper } from "../ui/tooltip"
import { Button } from "../ui/button"
import { ShowUnknownMarketsToggle } from "../ui/show-unknown-markets-toggle"
import { TraderTabs } from "./trader-tabs"
import { formatNumber, formatPriceCents, formatDateShort, formatTime, pnlColorClass } from "@/lib/format"
import { normalizePolymarketS3ImageUrl } from "@/lib/image-url"
import { cn } from "@/lib/utils"

function formatSharesLine(row: PositionEntry) {
	const balance = row.current_shares_balance
	if (balance == null) return null
	return `${formatNumber(balance, { decimals: 2 })} shares`
}

const defaultColumnVisibility: VisibilityState = {
	current_value: false,
	buys: false,
	sells: false,
	total_fees: false,
	redemption_usd: false,
}

function buildColumns(
	status: "open" | "closed",
	currentSortBy: TraderPositionSortBy,
	currentSortDirection: TraderSortDirection,
	onSortChange: (sortBy: TraderPositionSortBy) => void,
): ColumnDef<PositionEntry, unknown>[] {
	// The backend has no current_price sort key, so this composite column uses the closest
	// server-supported price field for each tab.
	const entryCurrentSortBy = status === "closed" ? "avg_exit_price" : "avg_entry_price"

	return [
		{
			id: "market",
			meta: { title: "Market" },
			header: () => (
				<SortableHeader
					sortBy="title"
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					Market
				</SortableHeader>
			),
			size: 520,
			cell: ({ row }) => {
				const entry = row.original
				const isUnknownMarket = !entry.title
				const title = entry.title || "Unknown Market"
				const sharesLine = formatSharesLine(entry)
				const href = entry.market_slug ? (`/markets/${entry.market_slug}` as Route) : null
				return (
					<div className="flex items-center gap-3">
						{entry.image_url ? (
							<img
								className="size-10 rounded-md object-cover"
								alt={title}
								src={normalizePolymarketS3ImageUrl(entry.image_url) ?? ""}
							/>
						) : (
							<div className="size-10 shrink-0 rounded-md bg-muted" />
						)}
						<div className="min-w-0 flex-1 space-y-0.5">
							{isUnknownMarket ? (
								<p className="truncate text-base font-medium" title={title}>
									<TooltipWrapper content="Polymarket Gamma has no data on this market/position">
										<span className="cursor-help border-b border-dotted border-muted-foreground/50">
											{title}
										</span>
									</TooltipWrapper>
								</p>
							) : href ? (
								<Link
									href={href}
									prefetch={false}
									className="block truncate text-base font-medium text-foreground underline-offset-4 hover:underline"
									title={title}
								>
									{title}
								</Link>
							) : (
								<p className="truncate text-base font-medium" title={title}>
									{title}
								</p>
							)}
							<div className="flex flex-wrap items-center gap-1.5">
								{entry.outcome ? (
									<Badge
										variant={
											entry.outcome_index === 0
												? "positive"
												: entry.outcome_index === 1
													? "negative"
													: "secondary"
										}
									>
										{entry.outcome}
									</Badge>
								) : null}
								{entry.redeemable ? (
									<Badge variant="redeemable">Redeemable</Badge>
								) : null}
								{sharesLine ? (
									<p className="truncate text-sm text-muted-foreground" title={sharesLine}>
										{sharesLine}
									</p>
								) : null}
							</div>
						</div>
					</div>
				)
			},
		},
		{
			id: "entry_current",
			meta: { title: "Entry / Current" },
			header: () => (
				<SortableHeader
					sortBy={entryCurrentSortBy}
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					Entry / Current
				</SortableHeader>
			),
			size: 140,
			cell: ({ row }) => {
				const entry = row.original
				const isEntryUnknown = entry.avg_entry_price == null

				return (
					<p>
						{isEntryUnknown ? (
							<TooltipWrapper content="This position may be split/merged/transferred hence the entry is unknown">
								<span className="cursor-help border-b border-dotted border-muted-foreground/50">—</span>
							</TooltipWrapper>
						) : (
							formatPriceCents(entry.avg_entry_price)
						)}{" "}
						<span className="text-muted-foreground">/</span>{" "}
						{formatPriceCents(entry.current_price ?? entry.avg_exit_price ?? 0)}
					</p>
				)
			},
		},
		{
			id: "realized_pnl",
			meta: { title: "PnL" },
			header: () => (
				<SortableHeader
					sortBy="realized_pnl_usd"
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					<span className="flex items-center gap-1.5">
						PnL
					</span>
				</SortableHeader>
			),
			size: 150,
			cell: ({ row }) => {
				const entry = row.original
				const pnl = entry.realized_pnl_usd ?? 0
				return (
					<p className={cn(pnlColorClass(pnl))}>
						{formatNumber(pnl, { currency: true, compact: true })}
						{entry.realized_pnl_pct != null ? (
							<span className="text-muted-foreground">
								{" "}
								({formatNumber(entry.realized_pnl_pct, { percent: true })})
							</span>
						) : null}
					</p>
				)
			},
		},
		...(status === "open"
			? [
					{
						id: "current_value",
						meta: { title: "Current Value" },
						header: () => (
							<SortableHeader
								sortBy="current_value"
								currentSortBy={currentSortBy}
								currentSortDirection={currentSortDirection}
								onSortChange={onSortChange}
							>
								Current Value
							</SortableHeader>
						),
						size: 160,
						cell: ({ row }) => {
							const entry = row.original
							return (
								<div>
									<p>{formatNumber(entry.current_value ?? 0, { currency: true, compact: true })}</p>
									<p className="text-sm text-muted-foreground">
										{formatNumber(entry.current_shares_balance ?? 0, { decimals: 2 })} shares
									</p>
								</div>
							)
						},
					} satisfies ColumnDef<PositionEntry, unknown>,
				]
			: []),
		{
			id: "buys",
			meta: { title: "Buys" },
			header: () => (
				<SortableHeader
					sortBy="total_buy_usd"
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					Buys
				</SortableHeader>
			),
			size: 160,
			cell: ({ row }) => {
				const usd = row.original.total_buy_usd ?? 0
				const count = row.original.total_buys ?? 0
				return (
					<p className="tabular-nums">
						<span>{formatNumber(usd, { currency: true, compact: true })}</span>
						{count > 0 ? (
							<span className="text-muted-foreground"> · {formatNumber(count, { decimals: 0 })}</span>
						) : null}
					</p>
				)
			},
		},
		{
			id: "sells",
			meta: { title: "Sells" },
			header: () => (
				<SortableHeader
					sortBy="total_sell_usd"
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					Sells
				</SortableHeader>
			),
			size: 160,
			cell: ({ row }) => {
				const usd = row.original.total_sell_usd ?? 0
				const count = row.original.total_sells ?? 0
				return (
					<p className="tabular-nums">
						<span>{formatNumber(usd, { currency: true, compact: true })}</span>
						{count > 0 ? (
							<span className="text-muted-foreground"> · {formatNumber(count, { decimals: 0 })}</span>
						) : null}
					</p>
				)
			},
		},
		{
			id: "total_fees",
			meta: { title: "Fees" },
			header: () => (
				<SortableHeader
					sortBy="total_fees"
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					Fees
				</SortableHeader>
			),
			size: 110,
			cell: ({ row }) => (
				<p>{formatNumber(row.original.total_fees ?? 0, { currency: true })}</p>
			),
		},
		{
			id: "redemption_usd",
			meta: { title: "Redemption" },
			header: () => (
				<SortableHeader
					sortBy="redemption_usd"
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					Redemption
				</SortableHeader>
			),
			size: 130,
			cell: ({ row }) => {
				const val = row.original.redemption_usd ?? 0
				return <p>{formatNumber(val, { currency: true, compact: true })}</p>
			},
		},
		{
			id: "last_trade_at",
			meta: { title: "Last Active" },
			header: () => (
				<SortableHeader
					sortBy="last_trade_at"
					currentSortBy={currentSortBy}
					currentSortDirection={currentSortDirection}
					onSortChange={onSortChange}
				>
					Last Active
				</SortableHeader>
			),
			size: 150,
			cell: ({ row }) => {
				const lastTradeAtMs = row.original.last_trade_at
				const lastTradeAtSec = lastTradeAtMs ? lastTradeAtMs / 1000 : null
				const time = formatTime(lastTradeAtSec)

				return (
					<div title={lastTradeAtMs ? new Date(lastTradeAtMs).toLocaleString("en-US") : undefined}>
						<p>{formatDateShort(lastTradeAtSec)}</p>
						{time ? <p className="text-sm text-muted-foreground">{time}</p> : null}
					</div>
				)
			},
		},
		{
			id: "link",
			header: "",
			size: 64,
			enableHiding: false,
			cell: ({ row }) => {
				const slug = row.original.market_slug
				if (!slug) return null
				return (
					<div className="flex justify-end">
						<TooltipWrapper content="View on Polymarket">
							<a
								href={`https://polymarket.com/market/${slug}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button variant="ghost" size="icon" aria-label="View on Polymarket">
									<ExternalLinkIcon className="size-4" />
								</Button>
							</a>
						</TooltipWrapper>
					</div>
				)
			},
		},
	]
}

type Props = {
	address: string
	page: PaginatedResource<PositionEntry, number>
	pageNumber: number
	status: "open" | "closed"
	sortBy: TraderPositionSortBy
	sortDirection: TraderSortDirection
	tabs?: ReactNode
	onRefresh?: () => Promise<void>
}

export default function TraderPositions({
	address,
	page,
	pageNumber,
	status,
	sortBy,
	sortDirection,
	tabs,
	onRefresh,
}: Props) {
	const [isPending, startTransition] = useTransition()
	const [tableState, setTableState] = useState(() => ({
		sourcePage: page,
		sourcePageNumber: pageNumber,
		sourceSortBy: sortBy,
		sourceSortDirection: sortDirection,
		page,
		pageNumber,
		sortBy,
		sortDirection,
	}))
	const [, setSearchParams] = useQueryStates(traderSearchParamParsers, {
		history: "push",
		scroll: false,
		shallow: true,
		startTransition,
	})

	const [showUnknown, setShowUnknown] = useState(false)

	const hasLocalTableState =
		tableState.sourcePage === page &&
		tableState.sourcePageNumber === pageNumber &&
		tableState.sourceSortBy === sortBy &&
		tableState.sourceSortDirection === sortDirection
	const currentPage = hasLocalTableState ? tableState.page : page
	const currentPageNumber = hasLocalTableState ? tableState.pageNumber : pageNumber
	const currentSortBy = hasLocalTableState ? tableState.sortBy : sortBy
	const currentSortDirection = hasLocalTableState ? tableState.sortDirection : sortDirection

	const hasUnknownMarkets = currentPage.data.some((entry) => !entry.title)

	const loadPage = useCallback((nextPageNumber: number, nextSortBy: TraderPositionSortBy, nextSortDirection: TraderSortDirection) => {
		startTransition(async () => {
			if (status === "open") {
				void setSearchParams({
					openSortBy: nextSortBy,
					openSortDirection: nextSortDirection,
					openPage: nextPageNumber,
				})
			} else {
				void setSearchParams({
					closedSortBy: nextSortBy,
					closedSortDirection: nextSortDirection,
					closedPage: nextPageNumber,
				})
			}

			const result = await getTraderPositionsPageAction({
				address,
				status,
				pageNumber: nextPageNumber,
				sortBy: nextSortBy,
				sortDirection: nextSortDirection,
			})

			setTableState({
				sourcePage: page,
				sourcePageNumber: pageNumber,
				sourceSortBy: sortBy,
				sourceSortDirection: sortDirection,
				page: result.page,
				pageNumber: result.pageNumber,
				sortBy: nextSortBy,
				sortDirection: nextSortDirection,
			})
		})
	}, [address, page, pageNumber, setSearchParams, sortBy, sortDirection, startTransition, status])

	const handleSortChange = useCallback((nextSortBy: TraderPositionSortBy) => {
		const nextSortDirection: TraderSortDirection =
			nextSortBy === currentSortBy && currentSortDirection === "desc" ? "asc" : "desc"

		loadPage(1, nextSortBy, nextSortDirection)
	}, [currentSortBy, currentSortDirection, loadPage])

	const columns = useMemo(
		() => buildColumns(status, currentSortBy, currentSortDirection, handleSortChange),
		[handleSortChange, currentSortBy, currentSortDirection, status],
	)

	const data = useMemo(() => {
		if (showUnknown) {
			return currentPage.data
		}
		return currentPage.data.filter((entry) => entry.title)
	}, [currentPage.data, showUnknown])

	const toolbarRight = (
		<div className="flex items-center gap-3">
			{hasUnknownMarkets ? (
				<ShowUnknownMarketsToggle show={showUnknown} onToggle={setShowUnknown} />
			) : null}
			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					if (!onRefresh) return
					startTransition(async () => {
						await onRefresh()
					})
				}}
				disabled={isPending || !onRefresh}
			>
				<RefreshCwIcon data-icon="inline-start" />
				Refresh
			</Button>
		</div>
	)

	return (
		<DataTable
			toolbarLeft={tabs ?? <TraderTabs />}
			toolbarRight={toolbarRight}
			columns={columns}
			data={data}
			storageKey="positions-table"
			defaultColumnVisibility={defaultColumnVisibility}
			emptyMessage="No positions to show."
			emptyClassName="py-24"
			columnLayout="fixed"
			paginationMode="server"
			pageIndex={currentPageNumber - 1}
			pageSize={currentPage.pageSize}
			hasNextPage={currentPage.hasMore}
			isLoading={isPending}
			onPageIndexChange={(nextPageIndex) => {
				const nextPageNumber = Math.min(Math.max(nextPageIndex + 1, 1), maxTraderPageNumber)

				if (nextPageNumber === currentPageNumber) {
					return
				}

				loadPage(nextPageNumber, currentSortBy, currentSortDirection)
			}}
		/>
	)
}
