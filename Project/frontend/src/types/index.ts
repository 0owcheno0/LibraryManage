export * from './document';

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 排序参数类型
export interface SortParams {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}
