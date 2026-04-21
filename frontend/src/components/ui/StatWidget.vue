<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  variant?: 'default' | 'danger' | 'success' | 'warning'
}>()
</script>

<template>
  <div :class="['stat-widget', variant ? `stat-widget--${variant}` : '']">
    <span class="stat-widget__value tabular-nums">{{ value }}</span>
    <span class="stat-widget__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.stat-widget {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-widget__value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-widget__label {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.stat-widget--danger .stat-widget__value {
  color: var(--color-danger);
}

.stat-widget--success .stat-widget__value {
  color: var(--color-success);
}

.stat-widget--warning .stat-widget__value {
  color: var(--color-warning);
}
</style>
