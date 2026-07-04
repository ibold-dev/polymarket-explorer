export * from './types_dir/index';

export interface PaginatedResource<T, C = string> {
  data: T[];
  next_cursor?: C;
  nextCursor?: C;
  limit?: number;
  offset?: number;
  count?: number;
  hasMore?: boolean;
  pageSize?: number;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
