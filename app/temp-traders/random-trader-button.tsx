"use client";

import { ShuffleIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function RandomTraderButton({ addresses }: { addresses: readonly string[] }) {
	const router = useRouter();

	function handleClick() {
		if (addresses.length === 0) return;
		const address = addresses[Math.floor(Math.random() * addresses.length)];
		router.push(`/traders/${address}` as Route);
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleClick}
			disabled={addresses.length === 0}
		>
			<ShuffleIcon aria-hidden="true" className="size-4" />
			Random
		</Button>
	);
}
