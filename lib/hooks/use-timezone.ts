"use client";

import { useCallback } from "react";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { resolveBrowserTimezone } from "@/lib/pnl-timezones";

export const TIMEZONE_STORAGE_KEY = "pmx:timezone";
export const TIMEZONE_COOKIE_NAME = "pmx-tz";
const TIMEZONE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const TIMEZONE_PATTERN = /^[A-Za-z][A-Za-z0-9_+\-/]{0,63}$/;

function isValidTimezone(value: unknown): value is string {
	if (typeof value !== "string") return false;
	if (!TIMEZONE_PATTERN.test(value)) return false;
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: value });
		return true;
	} catch {
		return false;
	}
}

function deserialize(raw: string): string {
	try {
		const parsed = JSON.parse(raw) as unknown;
		return isValidTimezone(parsed) ? parsed : resolveBrowserTimezone();
	} catch {
		return resolveBrowserTimezone();
	}
}

function writeCookie(value: string) {
	if (typeof document === "undefined") return;
	const encoded = encodeURIComponent(value);
	document.cookie = `${TIMEZONE_COOKIE_NAME}=${encoded}; path=/; max-age=${TIMEZONE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function useTimezone() {
	const [timezone, setTimezoneState] = useLocalStorage<string>(
		TIMEZONE_STORAGE_KEY,
		resolveBrowserTimezone,
		{ deserialize },
	);

	const setTimezone = useCallback(
		(next: string) => {
			if (!isValidTimezone(next)) return;
			setTimezoneState(next);
			writeCookie(next);
		},
		[setTimezoneState],
	);

	return { timezone, setTimezone } as const;
}
