export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ApiMeta;
  }
  
  export interface ApiError {
    code: string;
    message: string;
    details?: any;
  }
  
  export interface ApiMeta {
    pagination?: PaginationMeta;
  }
  
  export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }