import { createParser, parseAsStringLiteral } from "nuqs";

import { compareCodesParserDef } from "./builder-compare-search-params-shared";
import {
	BUILDER_TIMEFRAME_OPTIONS,
	DEFAULT_BUILDER_TIMEFRAME,
} from "./polymarket/builder-shared";

export const compareCodesParser = createParser<string[]>(compareCodesParserDef).withDefault([]);

export const compareTimeframeParser = parseAsStringLiteral(BUILDER_TIMEFRAME_OPTIONS).withDefault(
	DEFAULT_BUILDER_TIMEFRAME,
);

export const builderCompareSearchParamParsers = {
	codes: compareCodesParser,
	timeframe: compareTimeframeParser,
};
