import "server-only";

import { cookies } from "next/headers";

export const TIMEZONE_COOKIE_NAME = "pmx-tz";
const TIMEZONE_PATTERN = /^[A-Za-z][A-Za-z0-9_+\-/]{0,63}$/;

function isValidTimezone(value: string): boolean {
	if (!TIMEZONE_PATTERN.test(value)) return false;
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: value });
		return true;
	} catch {
		return false;
	}
}

export async function getServerTimezone(): Promise<string> {
	const store = await cookies();
	const raw = store.get(TIMEZONE_COOKIE_NAME)?.value;
	if (!raw) return "UTC";
	const decoded = decodeURIComponent(raw);
	return isValidTimezone(decoded) ? decoded : "UTC";
}
