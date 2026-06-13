"use client"

import { useTransition } from "react"
import { useQueryStates } from "nuqs"
import posthog from "posthog-js"

import {
	pnlAnchorParser,
	pnlFromParser,
	pnlTimeframeParser,
	pnlToParser,
} from "@/lib/trader-search-params"
import { pnlTimeframeValues, type PnlTimeframe } from "@/lib/struct/pnl-timeframes"
import { TooltipWrapper } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const TIMEFRAME_LABELS: Record<PnlTimeframe, string> = {
	"1d": "Last 24 hours",
	"1w": "Last 7 days",
	"1m": "Last 30 days",
	all: "All time",
}

const RANGE_PARAMS = {
	pnlTimeframe: pnlTimeframeParser,
	pnlAnchor: pnlAnchorParser,
	pnlFrom: pnlFromParser,
	pnlTo: pnlToParser,
}

type PnlTimeframeSelectorProps = {
	active: PnlTimeframe | null
	pending?: boolean
	onChange?: (timeframe: PnlTimeframe) => void
}

export function PnlTimeframeSelector({ active, pending = false, onChange }: PnlTimeframeSelectorProps) {
	const [isUrlPending, startTransition] = useTransition()
	const [, setParams] = useQueryStates(RANGE_PARAMS, {
		history: "push",
		shallow: true,
		scroll: false,
		startTransition,
	})

	function applyTimeframe(next: PnlTimeframe) {
		if (next === active) return
		posthog.capture("trader_pnl_timeframe_selected", { timeframe: next })
		setParams({
			pnlTimeframe: next,
			pnlAnchor: null,
			pnlFrom: null,
			pnlTo: null,
		})
		onChange?.(next)
	}

	return (
		<div
			className={cn(
				"inline-flex h-7 items-center rounded-md border border-border/60 bg-muted/40 p-0.5",
				(isUrlPending || pending) && "opacity-70",
			)}
		>
			{pnlTimeframeValues.map((value) => {
				const isActive = value === active
				const label = TIMEFRAME_LABELS[value]
				const disabled = isUrlPending || pending
				return (
					<TooltipWrapper key={value} content={label}>
						<button
							type="button"
							aria-pressed={isActive}
							aria-label={label}
							disabled={disabled}
							onClick={() => applyTimeframe(value)}
							className={cn(
								"rounded-sm px-2 text-xs font-medium leading-6 transition-colors",
								isActive
									? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{value.toUpperCase()}
						</button>
					</TooltipWrapper>
				)
			})}
		</div>
	)
}
