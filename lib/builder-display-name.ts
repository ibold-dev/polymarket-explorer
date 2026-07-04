import type { BuilderLatestRowWithMetadata, BuilderMetadata } from "@/lib/polymarket/types";

import { formatBuilderCodeDisplay } from "@/lib/utils";

type BuilderEmbeddedMetadata = NonNullable<BuilderLatestRowWithMetadata["metadata"]>;

export function getBuilderDisplayName(
	code: string,
	metadata: BuilderEmbeddedMetadata | BuilderMetadata | null | undefined,
) {
	const name = metadata?.name?.trim();
	if (name) return name;
	return formatBuilderCodeDisplay(code);
}
