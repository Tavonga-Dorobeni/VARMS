import 'vue-router'
import type { UserRole } from './enums'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    requiredRoles?: UserRole[]
  }
}
