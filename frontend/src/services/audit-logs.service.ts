import api from './api'
import type { AuditLog } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'

export interface AuditLogFilters extends PaginationParams {
  user_id?: number
  role?: string
  action?: string
  entity_type?: string
}

export async function listAuditLogs(params: AuditLogFilters = {}): Promise<PaginatedData<AuditLog>> {
  const response = await api.get('/audit-logs', { params })
  return response.data as PaginatedData<AuditLog>
}

export async function exportAuditLogs(params: AuditLogFilters = {}): Promise<void> {
  const response = await api.get('/audit-logs/export', {
    params,
    responseType: 'blob',
  })
  const blob = new Blob([response.data as BlobPart], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
