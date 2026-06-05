export const tagViewValues = ["events", "markets", "top-traders"] as const;
export type TagView = (typeof tagViewValues)[number];
export const DEFAULT_TAG_VIEW: TagView = "events";

export const viewLabels: Record<TagView, string> = {
	events: "Events",
	markets: "Markets",
	"top-traders": "Top Traders",
};

export function parseTagView(value: string | string[] | undefined, allowedViews?: readonly TagView[]): TagView {
	const raw = Array.isArray(value) ? value[0] : value;
	const allowed = allowedViews ?? tagViewValues;
	return allowed.includes(raw as TagView) ? (raw as TagView) : DEFAULT_TAG_VIEW;
}
