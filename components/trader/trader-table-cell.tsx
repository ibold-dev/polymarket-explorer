"use client";

import { Facehash } from "facehash";
import type { Route } from "next";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { facehashColorClasses } from "@/lib/facehash";
import { normalizePolymarketS3ImageUrl } from "@/lib/image-url";
import { cn, getTraderDisplayName, normalizeWalletAddress } from "@/lib/utils";

type TraderTableCellProps = {
	trader: {
		address: string;
		name?: string | null;
		pseudonym?: string | null;
		profile_image?: string | null;
	};
	maxNameWidthClassName?: string;
	className?: string;
};

export function TraderTableCell({
	trader,
	maxNameWidthClassName = "max-w-[16rem]",
	className,
}: TraderTableCellProps) {
	const address = normalizeWalletAddress(trader.address) ?? trader.address;
	const displayName = getTraderDisplayName(trader);
	const imageSrc = trader.profile_image
		? (normalizePolymarketS3ImageUrl(trader.profile_image) ?? trader.profile_image)
		: null;

	return (
		<Link
			href={`/traders/${address}` as Route}
			prefetch={false}
			className={cn(
				"flex min-w-0 items-center gap-2 text-foreground underline-offset-4 hover:underline",
				className,
			)}
		>
			{imageSrc ? (
				<Avatar className="rounded-sm after:rounded-sm">
					<AvatarImage src={imageSrc} alt={`${displayName} avatar`} className="rounded-sm" />
					<AvatarFallback className="overflow-hidden rounded-sm! p-0">
						<Facehash
							className="size-8! rounded-sm!"
							colorClasses={facehashColorClasses}
							name={address}
						/>
					</AvatarFallback>
				</Avatar>
			) : (
				<Facehash
					className="size-8! shrink-0 overflow-hidden rounded-sm! border"
					colorClasses={facehashColorClasses}
					name={address}
				/>
			)}
			<span className={cn("block min-w-0 flex-1 truncate font-medium", maxNameWidthClassName)}>
				{displayName}
			</span>
		</Link>
	);
}
