<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import VButton from '@/components/ui/VButton.vue'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}

const roleLabels: Record<string, string> = {
  ADMIN: 'System Administrator',
  ZIMRA_OFFICER: 'ZIMRA Officer',
  DEALER: 'Dealership',
  CVR_OFFICER: 'CVR Officer',
  FIU_ANALYST: 'FIU Analyst',
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__brand">
      <strong>VARMS</strong>
    </div>
    <div class="topbar__spacer" />
    <div class="topbar__user">
      <span class="topbar__role">{{ roleLabels[auth.user?.role ?? ''] }}</span>
      <VButton variant="ghost" @click="handleLogout">Logout</VButton>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  height: var(--topbar-height);
  padding: 0 var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.topbar__brand {
  font-size: 1.125rem;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.topbar__spacer {
  flex: 1;
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.topbar__role {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  padding: 2px 10px;
  border-radius: var(--radius-sm);
}
</style>
