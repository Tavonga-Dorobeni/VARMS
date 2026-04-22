<script setup lang="ts">
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'critical' | 'info' | 'muted'

defineProps<{
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span :class="['v-badge', `v-badge--${variant ?? 'muted'}`, `v-badge--${size ?? 'sm'}`]">
    <slot />
  </span>
</template>

<style scoped>
.v-badge {
  display: inline-block;
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.v-badge--sm {
  padding: 2px 8px;
  font-size: 0.6875rem;
}

.v-badge--md {
  padding: 3px 10px;
  font-size: 0.75rem;
}

.v-badge--success {
  background: #DCFCE7;
  color: #166534;
}

.v-badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.v-badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.v-badge--critical {
  background: #7F1D1D;
  color: #FEE2E2;
}

.v-badge--info {
  background: #DBEAFE;
  color: #1E40AF;
}

.v-badge--muted {
  background: var(--color-bg);
  color: var(--color-text-secondary);
}
</style>
