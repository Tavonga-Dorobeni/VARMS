import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'
import adminRoutes from './routes/admin'
import zimraRoutes from './routes/zimra'
import dealerRoutes from './routes/dealer'
import cvrRoutes from './routes/cvr'
import fiuRoutes from './routes/fiu'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/pages/AccessDeniedPage.vue'),
      meta: { public: true },
    },
    ...adminRoutes,
    ...zimraRoutes,
    ...dealerRoutes,
    ...cvrRoutes,
    ...fiuRoutes,
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach(authGuard)

export default router
