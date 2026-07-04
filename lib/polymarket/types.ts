export * from './types_dir/index';

export interface PaginatedResource<T> {
  data: T[];
  next_cursor?: string;
  limit?: number;
  offset?: number;
  count?: number;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
