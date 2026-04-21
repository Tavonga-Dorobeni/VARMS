import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/types/enums'

const fiuRoutes: RouteRecordRaw[] = [
  {
    path: '/fiu',
    meta: { requiredRoles: [UserRole.FIU_ANALYST] },
    children: [
      {
        path: 'dashboard',
        name: 'fiu-dashboard',
        component: () => import('@/pages/fiu/DashboardPage.vue'),
      },
      {
        path: 'alerts',
        name: 'fiu-alerts',
        component: () => import('@/pages/fiu/AlertsListPage.vue'),
      },
      {
        path: 'alerts/:id',
        name: 'fiu-alert-detail',
        component: () => import('@/pages/fiu/AlertDetailPage.vue'),
        props: true,
      },
      {
        path: 'audit-logs',
        name: 'fiu-audit-logs',
        component: () => import('@/pages/fiu/AuditLogsPage.vue'),
      },
    ],
  },
]

export default fiuRoutes
