export interface PaginatedResponse<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}

export interface PageInfo {
  pages: number;
  pageSize: number;
  results: number;
  page: number;
}

export interface PaginatedRequest<T> {
  pageInfo: PageInfo;
  results: T[];
}

export interface ApiError {
  message: string;
  errors?: string[];
}
