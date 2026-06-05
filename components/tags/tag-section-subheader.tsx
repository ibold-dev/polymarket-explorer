"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

import { SectionSubheaderBar, type SubheaderSlot } from "@/components/layout/section-subheader-bar";
import { type TagView } from "@/lib/tag-view-shared";

import { buildViewHref } from "./tag-view-tabs";

export function TagSectionSubheader({
	slots,
	value,
}: {
	slots: SubheaderSlot[];
	value: TagView;
}) {
	const [, startTransition] = useTransition();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const search = searchParams.toString();

	const setView = useCallback(
		(nextView: string) => {
			if (nextView === value) return;
			posthog.capture("tag_view_changed", { view: nextView, previous_view: value });
			const href = buildViewHref(pathname, search, nextView as TagView);
			startTransition(() => {
				router.push(href, { scroll: false });
			});
		},
		[pathname, router, search, value],
	);

	const tabsSlot = slots.find((slot) => slot.type === "tabs");
	const tabControllers = tabsSlot ? { [tabsSlot.id]: { active: value, onSelect: setView } } : {};

	return <SectionSubheaderBar slots={slots} tabControllers={tabControllers} />;
}
