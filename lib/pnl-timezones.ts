export type TimezoneOption = {
	value: string;
	label: string;
};

export const PNL_COMMON_TIMEZONES: TimezoneOption[] = [
	{ value: "UTC", label: "UTC" },
	{ value: "America/New_York", label: "New York (ET)" },
	{ value: "America/Chicago", label: "Chicago (CT)" },
	{ value: "America/Denver", label: "Denver (MT)" },
	{ value: "America/Los_Angeles", label: "Los Angeles (PT)" },
	{ value: "America/Sao_Paulo", label: "São Paulo" },
	{ value: "Europe/London", label: "London" },
	{ value: "Europe/Berlin", label: "Berlin" },
	{ value: "Europe/Paris", label: "Paris" },
	{ value: "Africa/Johannesburg", label: "Johannesburg" },
	{ value: "Asia/Dubai", label: "Dubai" },
	{ value: "Asia/Kolkata", label: "Mumbai" },
	{ value: "Asia/Singapore", label: "Singapore" },
	{ value: "Asia/Hong_Kong", label: "Hong Kong" },
	{ value: "Asia/Tokyo", label: "Tokyo" },
	{ value: "Australia/Sydney", label: "Sydney" },
];

export function resolveBrowserTimezone(): string {
	if (typeof Intl === "undefined") return "UTC";
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
}
