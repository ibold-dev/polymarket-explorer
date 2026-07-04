import type { components } from "@/lib/polymarket/types";

export type TradeEvent = components["schemas"]["TradeEvent"];

export type TradeRow = TradeEvent & {
	image_url?: string | null;
	question?: string | null;
	outcome?: string | null;
	price?: number | null;
	shares_amount?: number | null;
	usd_amount?: number | null;
	fee?: number | null;
	slug?: string | null;
	side?: string | null;
};
