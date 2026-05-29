import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { getAuthBaseUrl } from "@/lib/env";

export const authClient = createAuthClient({
	baseURL: getAuthBaseUrl(),
	fetchOptions: {
		credentials: "include",
	},
	plugins: [emailOTPClient()],
});
