import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/types/enums'

const cvrRoutes: RouteRecordRaw[] = [
  {
    path: '/cvr',
    meta: { requiredRoles: [UserRole.CVR_OFFICER] },
    children: [
      {
        path: '',
        name: 'cvr-dashboard',
        component: () => import('@/pages/cvr/DashboardPage.vue'),
      },
      {
        path: 'register',
        name: 'cvr-register',
        component: () => import('@/pages/cvr/RegisterPage.vue'),
      },
    ],
  },
]

export default cvrRoutes
