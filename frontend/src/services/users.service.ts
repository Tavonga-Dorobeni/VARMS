import api from './api'
import type { User } from '@/types/models'
import type { PaginatedData, PaginationParams } from '@/types/api'
import type { UserRole, UserStatus } from '@/types/enums'

export interface CreateUserPayload {
  full_name: string
  role: UserRole
  agency: string
  username: string
  password: string
  dealership_id?: number | null
  status?: UserStatus
}

export interface UpdateUserPayload {
  full_name?: string
  role?: UserRole
  agency?: string
  status?: UserStatus
  dealership_id?: number | null
}

export async function listUsers(params: PaginationParams): Promise<PaginatedData<User>> {
  const response = await api.get('/users', { params })
  return response.data as PaginatedData<User>
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post('/users', payload)
  return response.data as User
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  const response = await api.patch(`/users/${id}`, payload)
  return response.data as User
}
