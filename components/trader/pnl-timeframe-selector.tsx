"use client"

import { useTransition } from "react"
import { useQueryStates } from "nuqs"

import {
	pnlAnchorParser,
	pnlFromParser,
	pnlTimeframeParser,
	pnlToParser,
} from "@/lib/trader-search-params"
import { pnlTimeframeValues, type PnlTimeframe } from "@/lib/struct/pnl-timeframes"
import { cn } from "@/lib/utils"

const RANGE_PARAMS = {
	pnlTimeframe: pnlTimeframeParser,
	pnlAnchor: pnlAnchorParser,
	pnlFrom: pnlFromParser,
	pnlTo: pnlToParser,
}

type PnlTimeframeSelectorProps = {
	active: PnlTimeframe | null
}

export function PnlTimeframeSelector({ active }: PnlTimeframeSelectorProps) {
	const [isPending, startTransition] = useTransition()
	const [, setParams] = useQueryStates(RANGE_PARAMS, {
		history: "push",
		shallow: false,
		scroll: false,
		startTransition,
	})

	function applyTimeframe(next: PnlTimeframe) {
		if (next === active) return
		setParams({
			pnlTimeframe: next,
			pnlAnchor: null,
			pnlFrom: null,
			pnlTo: null,
		})
	}

	return (
		<div
			className={cn(
				"inline-flex h-7 items-center rounded-md border border-border/60 bg-muted/40 p-0.5",
				isPending && "opacity-70",
			)}
		>
			{pnlTimeframeValues.map((value) => {
				const isActive = value === active
				return (
					<button
						key={value}
						type="button"
						aria-pressed={isActive}
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
				)
			})}
		</div>
	)
}
