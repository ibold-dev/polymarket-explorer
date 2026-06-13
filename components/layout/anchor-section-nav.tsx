"use client";

import { useScrollSpy } from "@/lib/hooks/use-scroll-spy";

import { SectionSubheader, SubheaderNavButton } from "./section-subheader";

export type AnchorNavItem = {
	id: string;
	label: string;
};

export function AnchorSectionNav({ items }: { items: AnchorNavItem[] }) {
	const activeId = useScrollSpy(items.map((item) => item.id));

	const handleSelect = (id: string) => {
		const el = document.getElementById(id);
		if (!el) {
			return;
		}

		el.scrollIntoView({ behavior: "smooth", block: "start" });
		window.history.replaceState(window.history.state, "", `#${id}`);
	};

	return (
		<SectionSubheader>
			{items.map((item) => (
				<SubheaderNavButton
					key={item.id}
					active={activeId === item.id}
					onSelect={() => handleSelect(item.id)}
				>
					{item.label}
				</SubheaderNavButton>
			))}
		</SectionSubheader>
	);
}
