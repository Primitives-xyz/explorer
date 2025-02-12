export interface PaginatedData<T> {
  items: T[]
  hasMore: boolean
  page?: number
  pageSize?: number
}
