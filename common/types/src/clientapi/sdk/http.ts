/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/** Paginated response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** API error detail */
export interface ApiErrorDetail {
  status: number;
  statusText: string;
  message: string;
  data?: unknown;
  url?: string;
  method?: string;
}
