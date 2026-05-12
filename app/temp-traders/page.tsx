import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getTraderWhitelist } from "@/lib/struct/queries";
import { truncateAddress } from "@/lib/utils";

import { RandomTraderButton } from "./random-trader-button";

export const metadata: Metadata = {
	title: "Temp Traders",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function TempTradersPage() {
	const traderAddresses = await getTraderWhitelist();

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-xl font-medium tracking-tight">Temp Traders</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{traderAddresses.length} whitelisted trader links.
					</p>
				</div>
				<RandomTraderButton addresses={traderAddresses} />
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-16">#</TableHead>
						<TableHead>Address</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{traderAddresses.map((address, index) => (
						<TableRow key={address}>
							<TableCell className="text-muted-foreground tabular-nums">
								{index + 1}
							</TableCell>
							<TableCell>
								<Link
									href={`/traders/${address}` as Route}
									prefetch={false}
									className="font-mono text-sm text-foreground underline-offset-4 hover:underline"
									title={address}
								>
									<span className="hidden sm:inline">{address}</span>
									<span className="sm:hidden">{truncateAddress(address)}</span>
								</Link>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</main>
	);
}
