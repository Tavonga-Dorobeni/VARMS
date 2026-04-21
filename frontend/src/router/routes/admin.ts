import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/types/enums'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    meta: { requiredRoles: [UserRole.ADMIN] },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/pages/admin/DashboardPage.vue'),
      },
      {
        path: 'dealers',
        name: 'admin-dealers',
        component: () => import('@/pages/admin/DealersListPage.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/pages/admin/UsersListPage.vue'),
      },
      {
        path: 'audit-logs',
        name: 'admin-audit-logs',
        component: () => import('@/pages/admin/AuditLogsPage.vue'),
      },
    ],
  },
]

export default adminRoutes
