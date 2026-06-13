"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignInForm } from "./sign-in-form";

export function SignInDialog({
	open,
	onOpenChange,
	title = "Sign in to Struct",
	description = "Log in or create an account to continue.",
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
}) {
	const router = useRouter();

	function handleSuccess() {
		onOpenChange(false);
		router.refresh();
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<SignInForm onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	);
}
