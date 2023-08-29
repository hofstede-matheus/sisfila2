export interface PaginatedData<T> {
  data: T[];
  totalPages: number;
}

export const PAGE_SIZE = 10;
