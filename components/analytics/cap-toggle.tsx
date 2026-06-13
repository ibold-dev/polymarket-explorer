"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useTransition } from "react";

import { Toggle } from "@/components/ui/toggle";

export function AnalyticsCapToggle({
	cap,
	defaultCap = false,
	pending,
	onNavigate,
}: {
	cap: boolean;
	defaultCap?: boolean;
	pending?: boolean;
	onNavigate?: (args: { href: Route; cap: boolean }) => void;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	function handleChange(pressed: boolean) {
		posthog.capture("analytics_cap_toggled", { capped: pressed });
		const params = new URLSearchParams(searchParams.toString());
		if (pressed === defaultCap) {
			params.delete("cap");
		} else {
			params.set("cap", pressed ? "1" : "0");
		}
		const query = params.toString();
		const href = (query ? `${pathname}?${query}` : pathname) as Route;
		if (onNavigate) {
			onNavigate({ href, cap: pressed });
			return;
		}
		startTransition(() => {
			router.replace(href, { scroll: false });
		});
	}

	return (
		<Toggle
			pressed={cap}
			onPressedChange={handleChange}
			variant="outline"
			size="sm"
			disabled={isPending || pending}
			aria-label="Cap charts to market end time"
			data-pending={isPending || pending ? "" : undefined}
			className="data-[pending]:opacity-70"
		>
			Cap to end
		</Toggle>
	);
}
