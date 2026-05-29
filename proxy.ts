import { NextRequest, NextResponse } from "next/server";

import { getAuthBaseUrl } from "@/lib/env";

const GATED_PREFIXES = ["/account"];

function isGatedRoute(pathname: string): boolean {
	return GATED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
	const cookie = request.headers.get("cookie");
	if (!cookie) return false;

	try {
		const response = await fetch(`${getAuthBaseUrl()}/api/auth/get-session?disableCookieCache=true`, {
			method: "GET",
			headers: { cookie },
			cache: "no-store",
		});

		if (!response.ok) return false;

		const session = (await response.json()) as { session: unknown; user: unknown } | null;
		return session !== null && session.user !== null;
	} catch {
		return false;
	}
}

export async function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	if (!isGatedRoute(pathname)) {
		return NextResponse.next();
	}

	const isAuthenticated = await hasValidSession(request);
	if (!isAuthenticated) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/account/:path*"],
};
