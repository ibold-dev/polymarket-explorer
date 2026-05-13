"use client"

import { startTransition, useRef, useState } from "react"

import { ChartSettingsButton, PnlChartContent, type PnlChartMetric, type PnlChartMode } from "@/components/trader/pnl-chart"
import { PnlRangeDialog } from "@/components/trader/pnl-range-dialog"
import { PnlShareDialog } from "@/components/trader/pnl-share-dialog"
import { ShareIdentityHeader } from "@/components/trader/share-identity-header"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useTimezone } from "@/lib/hooks/use-timezone"
import type { PnlChartAnnotation, PnlDataPoint } from "@/lib/struct/pnl"
import type { ResolvedPnlRange } from "@/lib/struct/pnl-range"
import { cn } from "@/lib/utils"

const SHOW_HIGHLIGHTS_STORAGE_KEY = "polymarket-explorer:pnl-card:show-highlights"

type PnlCardProps = {
	data: PnlDataPoint[]
	displayName: string
	address: string
	profileImage?: string | null
	annotations?: PnlChartAnnotation[]
	pnlRange: ResolvedPnlRange
	firstTradeAt?: number
}

export function PnlCard({ data, displayName, address, profileImage, annotations = [], pnlRange, firstTradeAt }: PnlCardProps) {
	const cardRef = useRef<HTMLDivElement>(null)
	const [chartMode, setChartMode] = useState<PnlChartMode>("area")
	const [chartMetric, setChartMetric] = useState<PnlChartMetric>("pnl")
	const [showAnnotations, setShowAnnotations] = useLocalStorage(SHOW_HIGHLIGHTS_STORAGE_KEY, false)
	const { timezone: clientTimezone } = useTimezone()
	const timezone = clientTimezone ?? pnlRange.timezone
	const hasAnnotations = annotations.length > 0

	const annotationsEligible = pnlRange.mode === "preset" && pnlRange.timeframe === "all"
	const showChartAnnotations = annotationsEligible && showAnnotations
	const showTooltipTime = pnlRange.resolution !== "1d"

	return (
		<div ref={cardRef} className={cn("group/share-card rounded-lg bg-card p-4 sm:p-6")}>
			<ShareIdentityHeader address={address} displayName={displayName} profileImage={profileImage} />
			<PnlChartContent
				data={data}
				annotations={annotations}
				showAnnotations={showChartAnnotations}
				timeframe={pnlRange.timeframe}
				timezone={timezone}
				showTooltipTime={showTooltipTime}
				chartMode={chartMode}
				chartMetric={chartMetric}
				action={
					<div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
						{hasAnnotations && annotationsEligible ? (
							<Button
								variant={showAnnotations ? "secondary" : "ghost"}
								size="xs"
								aria-pressed={showAnnotations}
								onClick={() => startTransition(() => setShowAnnotations((current) => !current))}
							>
								Highlights
							</Button>
						) : null}
						<PnlRangeDialog
							mode={pnlRange.mode}
							timeframe={pnlRange.timeframe}
							anchor={pnlRange.anchor}
							from={pnlRange.from}
							to={pnlRange.to}
							timezone={timezone}
							firstTradeAt={firstTradeAt}
						/>
						<ChartSettingsButton
							chartMode={chartMode}
							onChartModeChange={setChartMode}
							chartMetric={chartMetric}
							onChartMetricChange={setChartMetric}
						/>
						<PnlShareDialog address={address} displayName={displayName} targetRef={cardRef} />
					</div>
				}
			/>
		</div>
	)
}
