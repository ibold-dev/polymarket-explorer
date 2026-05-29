"use client";

import { useState } from "react";
import { LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { SignInDialog } from "./sign-in-dialog";

export function AuthGate({
	children,
	lockedTitle = "Members only",
	lockedDescription = "Sign in to unlock this feature.",
	dialogTitle,
	dialogDescription,
}: {
	children: React.ReactNode;
	lockedTitle?: string;
	lockedDescription?: string;
	dialogTitle?: string;
	dialogDescription?: string;
}) {
	const { data: session, isPending } = authClient.useSession();
	const [open, setOpen] = useState(false);

	if (isPending) {
		return <div aria-hidden className="h-32 w-full animate-pulse rounded-xl bg-muted" />;
	}

	if (session?.user) {
		return <>{children}</>;
	}

	return (
		<>
			<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
				<div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<LockIcon className="size-4" />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-medium text-foreground">{lockedTitle}</p>
					<p className="text-sm text-muted-foreground">{lockedDescription}</p>
				</div>
				<Button size="sm" onClick={() => setOpen(true)}>
					Sign in
				</Button>
			</div>
			<SignInDialog open={open} onOpenChange={setOpen} title={dialogTitle} description={dialogDescription} />
		</>
	);
}
