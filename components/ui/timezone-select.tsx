"use client";

import { useMemo } from "react";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PNL_COMMON_TIMEZONES, resolveBrowserTimezone, type TimezoneOption } from "@/lib/pnl-timezones";

type TimezoneSelectProps = {
	value: string;
	onChange: (value: string) => void;
	size?: "sm" | "default";
	className?: string;
	contentClassName?: string;
	"aria-label"?: string;
};

function formatUtcOffset(timezone: string, now: Date): string {
	try {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			timeZoneName: "shortOffset",
		}).formatToParts(now);
		const tzPart = parts.find((p) => p.type === "timeZoneName")?.value;
		if (!tzPart) return "UTC";
		const normalized = tzPart.replace(/^GMT/, "UTC");
		return normalized === "UTC" ? "UTC" : normalized;
	} catch {
		return "UTC";
	}
}

function parseOffsetMinutes(offset: string): number {
	if (offset === "UTC") return 0;
	const match = /^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(offset);
	if (!match) return 0;
	const sign = match[1] === "-" ? -1 : 1;
	const hours = Number.parseInt(match[2], 10);
	const minutes = match[3] ? Number.parseInt(match[3], 10) : 0;
	return sign * (hours * 60 + minutes);
}

export function TimezoneSelect({ value, onChange, size = "sm", className, contentClassName, ...rest }: TimezoneSelectProps) {
	const options = useMemo<Array<TimezoneOption & { offset: string }>>(() => {
		const browserTimezone = resolveBrowserTimezone();
		const seen = new Set(PNL_COMMON_TIMEZONES.map((tz) => tz.value));
		const extras: TimezoneOption[] = [];
		if (!seen.has(browserTimezone)) {
			extras.push({ value: browserTimezone, label: `${browserTimezone} (browser)` });
		}
		if (value && !seen.has(value) && value !== browserTimezone) {
			extras.push({ value, label: value });
		}
		const now = new Date();
		return [...extras, ...PNL_COMMON_TIMEZONES]
			.map((option) => {
				const offset = formatUtcOffset(option.value, now);
				return { ...option, offset, offsetMinutes: parseOffsetMinutes(offset) };
			})
			.sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.label.localeCompare(b.label));
	}, [value]);

	function handleChange(next: string | null) {
		if (!next) return;
		onChange(next);
	}

	return (
		<Select value={value} onValueChange={handleChange}>
			<SelectTrigger size={size} className={className} aria-label={rest["aria-label"] ?? "Timezone"}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent className={contentClassName ?? "max-h-72"}>
				<SelectGroup>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							<span className="flex flex-1 items-center justify-between gap-3">
								<span className="truncate">{option.label}</span>
								<span className="font-mono text-[10px] tabular-nums text-muted-foreground">{option.offset}</span>
							</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
