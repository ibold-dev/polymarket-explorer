import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionAnchor({
	id,
	className,
	children,
}: {
	id: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div id={id} className={cn("scroll-mt-28 sm:scroll-mt-32", className)}>
			{children}
		</div>
	);
}
