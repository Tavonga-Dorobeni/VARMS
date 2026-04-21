import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/types/enums'

const zimraRoutes: RouteRecordRaw[] = [
  {
    path: '/zimra',
    meta: { requiredRoles: [UserRole.ZIMRA_OFFICER] },
    children: [
      {
        path: '',
        name: 'zimra-dashboard',
        component: () => import('@/pages/zimra/DashboardPage.vue'),
      },
      {
        path: 'import',
        name: 'zimra-import',
        component: () => import('@/pages/zimra/ImportFormPage.vue'),
      },
    ],
  },
]

export default zimraRoutes
