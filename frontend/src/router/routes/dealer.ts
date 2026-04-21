import type { RouteRecordRaw } from 'vue-router'
import { UserRole } from '@/types/enums'

const dealerRoutes: RouteRecordRaw[] = [
  {
    path: '/dealer',
    meta: { requiredRoles: [UserRole.DEALER] },
    children: [
      {
        path: '',
        name: 'dealer-dashboard',
        component: () => import('@/pages/dealer/DashboardPage.vue'),
      },
      {
        path: 'inventory',
        name: 'dealer-inventory',
        component: () => import('@/pages/dealer/InventoryPage.vue'),
      },
      {
        path: 'inventory/:id',
        name: 'dealer-vehicle-detail',
        component: () => import('@/pages/dealer/VehicleDetailPage.vue'),
        props: true,
      },
      {
        path: 'sales',
        name: 'dealer-sales',
        component: () => import('@/pages/dealer/SalesListPage.vue'),
      },
      {
        path: 'sales/new',
        name: 'dealer-sales-new',
        component: () => import('@/pages/dealer/SalesWizardPage.vue'),
      },
      {
        path: 'sales/success/:id',
        name: 'dealer-sale-success',
        component: () => import('@/pages/dealer/SaleSuccessPage.vue'),
        props: true,
      },
    ],
  },
]

export default dealerRoutes
