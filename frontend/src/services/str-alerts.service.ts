import api from './api'
import type { StrAlert } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'
import type { StrStatus } from '@/types/enums'

export interface StrAlertFilters extends PaginationParams {
  status?: string
  alert_type?: string
  dealership_id?: number
  severity?: string
}

export async function listAlerts(params: StrAlertFilters = {}): Promise<PaginatedData<StrAlert>> {
  const response = await api.get('/str-alerts', { params })
  return response.data as PaginatedData<StrAlert>
}

export async function getAlertById(id: number): Promise<StrAlert> {
  const response = await api.get(`/str-alerts/${id}`)
  return response.data as StrAlert
}

export async function updateAlertStatus(
  id: number,
  status: StrStatus,
  reason: string,
): Promise<StrAlert> {
  const response = await api.patch(`/str-alerts/${id}/status`, { status, reason })
  return response.data as StrAlert
}
