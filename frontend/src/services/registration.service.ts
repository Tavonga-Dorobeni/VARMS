import api from './api'
import type { RegistrationRecord } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'

export interface RegistrationCheck {
  key: string
  passed: boolean
  reason: string
  /** Present only when `key === 'NOMINEE_BUYER_HOLD'`: the STR alert that is blocking registration. */
  alert_id?: number
}

export interface RegistrationSearchResult {
  eligible: boolean
  failure_reason: string | null
  checks: RegistrationCheck[]
  vehicle: {
    id: number
    vin: string
    status: string
  }
}

export interface ApproveRegistrationPayload {
  vehicle_id: number
  national_id: string
  registration_date: string
}

export async function searchRegistration(
  params: { vin?: string; ref?: string; national_id: string },
): Promise<RegistrationSearchResult> {
  const response = await api.get('/registration/search', { params })
  return response.data as RegistrationSearchResult
}

export async function listRegistrations(
  params: PaginationParams & {
    search?: string
    status?: string
    date_from?: string
    date_to?: string
  } = {},
): Promise<PaginatedData<RegistrationRecord>> {
  const response = await api.get('/registration', { params })
  return response.data as PaginatedData<RegistrationRecord>
}

export async function approveRegistration(
  payload: ApproveRegistrationPayload,
): Promise<unknown> {
  const response = await api.post('/registration/approve', payload)
  return response.data
}
