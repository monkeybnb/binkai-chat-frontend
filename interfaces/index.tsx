export interface APIResponse<T = any> {
  data?: T;
  status?: number;
  error?: string;
  message?: string;
  success?: boolean;
  pagination?: Pagination;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  take: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
}
