import api from './api'
import type { ImportRecord } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'

export interface ZimraDashboardStats {
  today_imports: number
  monthly_imports: number
  total_imports: number
  top_dealers: { id: number; name: string; import_count: number }[]
}

export async function getZimraDashboardStats(): Promise<ZimraDashboardStats> {
  const response = await api.get('/zimra/dashboard-stats')
  return response.data as ZimraDashboardStats
}

export async function listImports(
  params: PaginationParams & {
    search?: string
    dealership_id?: number | string
    date_from?: string
    date_to?: string
  } = {},
): Promise<PaginatedData<ImportRecord>> {
  const response = await api.get('/zimra/imports', { params })
  return response.data as PaginatedData<ImportRecord>
}
