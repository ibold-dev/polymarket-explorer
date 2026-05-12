import "server-only";

import type { PaginatedResource } from "@/lib/struct/types";

export const defaultPageSize = 24;
export const maxPaginationRequests = 1000;

export type PaginatedResult<T> = {
	data: T[];
	hasMore: boolean;
	nextCursor: string | null;
};

export function logPaginationLimitReached(label: string) {
	console.error(`Struct SDK pagination aborted after ${maxPaginationRequests} requests: ${label}`);
}

export function emptyOffsetPage<T>(limit: number): PaginatedResource<T, number> {
	return {
		data: [],
		hasMore: false,
		nextCursor: null,
		pageSize: limit,
	};
}
