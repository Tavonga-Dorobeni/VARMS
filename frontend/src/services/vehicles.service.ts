import api from './api'
import type { Vehicle, ImportRecord } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'

export interface CreateImportPayload {
  vin: string
  make: string
  model: string
  declared_value: number
  country_of_origin: string
  import_date: string
  dealership_id: number
  border_post: string
}

export async function createImport(payload: CreateImportPayload): Promise<Vehicle> {
  const response = await api.post('/vehicles/import', payload)
  return response.data as Vehicle
}

export async function getImportRecord(id: number): Promise<ImportRecord> {
  const response = await api.get(`/vehicles/import/${id}`)
  return response.data as ImportRecord
}

export async function listInventory(dealerId: number, params: PaginationParams & Record<string, unknown> = {}): Promise<PaginatedData<Vehicle>> {
  const response = await api.get(`/dealers/${dealerId}/inventory`, { params })
  return response.data as PaginatedData<Vehicle>
}

export async function getVehicleDetail(id: number): Promise<Vehicle> {
  const response = await api.get(`/vehicles/${id}`)
  return response.data as Vehicle
}
