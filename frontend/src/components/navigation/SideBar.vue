<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types/enums'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const route = useRoute()

interface NavItem {
  label: string
  to: string
  icon: string
}

const navItems = computed<NavItem[]>(() => {
  const role = auth.user?.role
  switch (role) {
    case UserRole.ADMIN:
      return [
        { label: 'Dashboard', to: '/admin', icon: 'grid' },
        { label: 'Dealers', to: '/admin/dealers', icon: 'building' },
        { label: 'Users', to: '/admin/users', icon: 'users' },
        { label: 'Audit Logs', to: '/admin/audit-logs', icon: 'clipboard' },
      ]
    case UserRole.ZIMRA_OFFICER:
      return [
        { label: 'Dashboard', to: '/zimra', icon: 'grid' },
        { label: 'Vehicle Import', to: '/zimra/import', icon: 'truck' },
      ]
    case UserRole.DEALER:
      return [
        { label: 'Dashboard', to: '/dealer', icon: 'grid' },
        { label: 'Inventory', to: '/dealer/inventory', icon: 'car' },
        { label: 'Sales', to: '/dealer/sales', icon: 'plus-circle' },
      ]
    case UserRole.CVR_OFFICER:
      return [
        { label: 'Dashboard', to: '/cvr', icon: 'grid' },
        { label: 'Register Vehicle', to: '/cvr/register', icon: 'check-circle' },
      ]
    case UserRole.FIU_ANALYST:
      return [
        { label: 'Dashboard', to: '/fiu/dashboard', icon: 'grid' },
        { label: 'STR Alerts', to: '/fiu/alerts', icon: 'shield' },
        { label: 'Audit Logs', to: '/fiu/audit-logs', icon: 'clipboard' },
      ]
    default:
      return []
  }
})

const svgIcons: Record<string, string> = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  building: '<path d="M6 2L3 7v13h18V7l-3-5H6z"/><rect x="8" y="10" width="3" height="3"/><rect x="13" y="10" width="3" height="3"/><rect x="8" y="16" width="3" height="5"/><rect x="13" y="16" width="3" height="5"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  car: '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a1 1 0 0 0-.8.4L1.74 11 .84 11.86a1 1 0 0 0-.84.99V16h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  'plus-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
}

function isActive(item: NavItem): boolean {
  if (item.to === '/admin' || item.to === '/zimra' || item.to === '/dealer' || item.to === '/cvr') {
    return route.path === item.to
  }
  return route.path.startsWith(item.to)
}
</script>

<template>
  <nav class="sidebar">
    <ul class="sidebar__nav">
      <li v-for="(item, index) in navItems" :key="item.to">
        <div v-if="index === 1" class="sidebar__separator" />
        <RouterLink
          :to="item.to"
          :class="['sidebar__link', { 'sidebar__link--active': isActive(item) }]"
        >
          <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="svgIcons[item.icon] ?? ''" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--topbar-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--color-primary);
  padding: var(--space-4) 0;
  overflow-y: auto;
  z-index: 90;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar__separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: var(--space-2) var(--space-6);
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  border-left: 3px solid transparent;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar__link--active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: white;
}

.sidebar__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
