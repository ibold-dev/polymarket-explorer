import type { PolymarketCategory } from "@structbuild/sdk";

const POLYMARKET_CATEGORIES: PolymarketCategory[] = [
	"Politics",
	"Sports",
	"Crypto",
	"Finance",
	"Culture",
	"Mentions",
	"Weather",
	"Economics",
	"Tech",
];

const lookup = new Map<string, PolymarketCategory>(
	POLYMARKET_CATEGORIES.map((category) => [category.toLowerCase(), category]),
);

export function tagToCategory(tag: { slug?: string | null; label?: string | null }): PolymarketCategory | null {
	const candidates = [tag.slug, tag.label].filter((value): value is string => Boolean(value));
	for (const candidate of candidates) {
		const match = lookup.get(candidate.trim().toLowerCase());
		if (match) return match;
	}
	return null;
}
