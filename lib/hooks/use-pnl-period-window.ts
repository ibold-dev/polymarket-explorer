"use client"

import { useCallback } from "react"

import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import type { PnlPeriodWindow } from "@/lib/struct/pnl"

const STORAGE_KEY = "polymarket-explorer:pnl-period-window"
const DEFAULT_WINDOW: PnlPeriodWindow = "week"
const ALLOWED_WINDOWS: PnlPeriodWindow[] = ["day", "week", "month"]

function isPnlPeriodWindow(value: unknown): value is PnlPeriodWindow {
	return typeof value === "string" && (ALLOWED_WINDOWS as string[]).includes(value)
}

function deserializeWindow(value: string): PnlPeriodWindow {
	try {
		const parsed = JSON.parse(value)
		return isPnlPeriodWindow(parsed) ? parsed : DEFAULT_WINDOW
	} catch {
		return DEFAULT_WINDOW
	}
}

export function usePnlPeriodWindow() {
	const [value, setValue] = useLocalStorage<PnlPeriodWindow>(STORAGE_KEY, DEFAULT_WINDOW, {
		deserialize: deserializeWindow,
	})

	const setWindow = useCallback(
		(next: PnlPeriodWindow) => {
			setValue(next)
		},
		[setValue],
	)

	return [value, setWindow] as const
}
