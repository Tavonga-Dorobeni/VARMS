import api from './api'
import type { SaleTransaction } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'
import type { PaymentType } from '@/types/enums'

export interface CreateSalePayload {
  vehicle_id: number
  buyer_full_name: string
  buyer_national_id: string
  buyer_contact_details: string
  sale_price: number
  payment_type: PaymentType
  proof_of_payment: string
  sale_date: string
  is_acting_for_another: boolean
  beneficial_owner_full_name?: string
  beneficial_owner_national_id?: string
  beneficial_owner_relationship_type?: string
}

export async function createSale(payload: CreateSalePayload): Promise<SaleTransaction> {
  const response = await api.post('/sales', payload)
  return response.data as SaleTransaction
}

export async function listSales(params: PaginationParams & Record<string, unknown> = {}): Promise<PaginatedData<SaleTransaction>> {
  const response = await api.get('/sales', { params })
  return response.data as PaginatedData<SaleTransaction>
}

export async function getSaleById(id: number): Promise<SaleTransaction> {
  const response = await api.get(`/sales/${id}`)
  return response.data as SaleTransaction
}
