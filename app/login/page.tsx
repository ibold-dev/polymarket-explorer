import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
	title: "Sign in",
	robots: { index: false, follow: false },
};

export default function LoginPage() {
	return (
		<Suspense fallback={<div aria-hidden className="min-h-[50vh]" />}>
			<LoginView />
		</Suspense>
	);
}
