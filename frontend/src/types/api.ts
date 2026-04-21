export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface ValidationErrorResponse {
  success: false
  data: null
  error: string
  fields: Record<string, string>
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
