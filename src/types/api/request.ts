export interface PaginationParams {
    page?: number;
    limit?: number;
  }
  
  export interface SortParams {
    field: string;
    order: 'asc' | 'desc';
  }
  
  export interface FilterParams {
    [key: string]: string | number | boolean | string[] | number[];
  }