import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/enums'

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isAuthenticated && to.name === 'login') {
      next(getHomeRoute(auth.user!.role))
      return
    }
    next()
    return
  }

  if (!auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  const requiredRoles = getRequiredRoles(to)
  if (requiredRoles.length > 0 && !requiredRoles.includes(auth.user!.role)) {
    next({ name: 'access-denied' })
    return
  }

  next()
}

function getRequiredRoles(route: RouteLocationNormalized): UserRole[] {
  const roles: UserRole[] = []
  for (const match of route.matched) {
    if (match.meta.requiredRoles) {
      roles.push(...(match.meta.requiredRoles as UserRole[]))
    }
  }
  return roles
}

export function getHomeRoute(role: UserRole): string {
  const routeMap: Record<string, string> = {
    ADMIN: '/admin',
    ZIMRA_OFFICER: '/zimra',
    DEALER: '/dealer',
    CVR_OFFICER: '/cvr',
    FIU_ANALYST: '/fiu/dashboard',
  }
  return routeMap[role] || '/login'
}
