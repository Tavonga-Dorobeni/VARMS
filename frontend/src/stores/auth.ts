import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, LoginPayload } from '@/types/auth'
import type { UserRole } from '@/types/enums'
import { login as loginApi } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function hasRole(role: UserRole): boolean {
    return user.value?.role === role
  }

  async function login(payload: LoginPayload) {
    const data = await loginApi(payload)
    token.value = data.access_token
    user.value = data.user
  }

  function logout() {
    token.value = null
    user.value = null
  }

  function getToken(): string | null {
    return token.value
  }

  return {
    token,
    user,
    isAuthenticated,
    hasRole,
    login,
    logout,
    getToken,
  }
})
