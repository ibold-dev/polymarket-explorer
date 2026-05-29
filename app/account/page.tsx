import type { Metadata } from "next";

import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = {
	title: "Account",
	robots: { index: false, follow: false },
};

export default async function AccountPage() {
	const session = await requireSession("/account");

	return (
		<div className="mx-auto w-full max-w-2xl px-4 py-12">
			<h1 className="text-xl font-semibold text-foreground">Account</h1>
			<p className="mt-2 text-sm text-muted-foreground">Signed in as {session.user.email}</p>
		</div>
	);
}
