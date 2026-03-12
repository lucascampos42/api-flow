export const DEFAULT_LIMIT = 10;

export interface SearchParams<T> {
  page?: number;
  limit?: number;
  orderBy?: 'asc' | 'desc';
  orderField?: T;
  search?: string;
}
