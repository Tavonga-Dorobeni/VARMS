import api from './api'
import type { Dealer } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'
import type { DealerStatus } from '@/types/enums'

export interface DealerFilters extends PaginationParams {
  status?: DealerStatus | ''
  search?: string
}

export interface CreateDealerPayload {
  name: string
  license_number: string
  address: string
  contact_info: string
  approved_at: string
}

export interface UpdateDealerStatusPayload {
  status: DealerStatus
  reason: string
}

export async function listDealers(params: DealerFilters): Promise<PaginatedData<Dealer>> {
  const response = await api.get('/dealers', { params })
  return response.data as PaginatedData<Dealer>
}

export async function getDealer(id: number): Promise<Dealer> {
  const response = await api.get(`/dealers/${id}`)
  return response.data as Dealer
}

export async function createDealer(payload: CreateDealerPayload): Promise<Dealer> {
  const response = await api.post('/dealers', payload)
  return response.data as Dealer
}

export async function updateDealer(id: number, payload: Partial<CreateDealerPayload>): Promise<Dealer> {
  const response = await api.patch(`/dealers/${id}`, payload)
  return response.data as Dealer
}

export async function updateDealerStatus(id: number, payload: UpdateDealerStatusPayload): Promise<Dealer> {
  const response = await api.patch(`/dealers/${id}/status`, payload)
  return response.data as Dealer
}
