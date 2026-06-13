"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { SignInForm } from "./sign-in-form";

function safeRedirect(value: string | null): Route {
	if (!value) return "/";
	try {
		const url = new URL(value, "http://localhost");
		const path = `${url.pathname}${url.search}`;
		if (url.origin === "http://localhost" && path.startsWith("/") && !path.startsWith("//")) {
			return path as Route;
		}
	} catch {
		return "/";
	}
	return "/";
}

export function LoginView() {
	const router = useRouter();
	const params = useSearchParams();
	const redirectTo = safeRedirect(params.get("redirectTo"));
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && session?.user) {
			router.replace(redirectTo);
		}
	}, [isPending, session, redirectTo, router]);

	return (
		<div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
			<div className="mb-6 space-y-1.5 text-center">
				<h1 className="text-xl font-semibold text-foreground">Welcome to Struct</h1>
				<p className="text-sm text-muted-foreground">Log in or create an account to continue.</p>
			</div>
			<SignInForm
				callbackURL={typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : redirectTo}
				onSuccess={() => router.replace(redirectTo)}
			/>
		</div>
	);
}
