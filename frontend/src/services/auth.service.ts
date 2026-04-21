import api from './api'
import type { LoginPayload, LoginResponse } from '@/types/auth'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post('/auth/login', payload)
  return response.data as LoginResponse
}
