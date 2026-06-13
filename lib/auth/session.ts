import "server-only";

import type { Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getAuthBaseUrl } from "@/lib/env";

export type SessionUser = {
	id: string;
	email: string;
	name?: string | null;
	image?: string | null;
};

export type Session = {
	user: SessionUser;
	session: {
		id: string;
		activeOrganizationId?: string | null;
	};
};

export const getSession = cache(async (): Promise<Session | null> => {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore
		.getAll()
		.map((entry) => `${entry.name}=${entry.value}`)
		.join("; ");

	if (!cookieHeader) return null;

	try {
		const response = await fetch(`${getAuthBaseUrl()}/api/auth/get-session?disableCookieCache=true`, {
			headers: { cookie: cookieHeader },
			cache: "no-store",
			signal: AbortSignal.timeout(5_000),
		});

		if (!response.ok) return null;
		if (!response.headers.get("content-type")?.includes("application/json")) return null;

		const data = (await response.json()) as Session | null;
		return data && data.user && data.user.id && data.user.email ? data : null;
	} catch {
		return null;
	}
});

export async function requireSession(redirectTo?: string): Promise<Session> {
	const session = await getSession();
	if (!session) {
		const query = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : "";
		redirect(`/login${query}` as Route);
	}
	return session;
}
