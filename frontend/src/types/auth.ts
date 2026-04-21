import type { UserRole } from './enums'

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthUser {
  userId: number
  role: UserRole
  agency: string
  dealershipId?: number | null
}

export interface LoginResponse {
  access_token: string
  user: AuthUser
}
