<script setup lang="ts">
import { computed } from 'vue'
import { VehicleStatus } from '@/types/enums'

const props = defineProps<{
  status: VehicleStatus | string
  size?: 'sm' | 'md'
}>()

const config = computed(() => {
  const map: Record<string, { label: string; variant: string }> = {
    [VehicleStatus.CLEARED]: { label: 'Cleared', variant: 'success' },
    [VehicleStatus.INVENTORY]: { label: 'In Inventory', variant: 'warning' },
    [VehicleStatus.SOLD]: { label: 'Sold', variant: 'success' },
    [VehicleStatus.REGISTERED]: { label: 'Registered', variant: 'success' },
    [VehicleStatus.STR_FLAGGED]: { label: 'STR Flagged', variant: 'danger' },
  }
  return map[props.status] ?? { label: props.status, variant: 'default' }
})
</script>

<template>
  <span :class="['badge', `badge--${config.variant}`, `badge--${size ?? 'md'}`]">
    {{ config.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  border-radius: 9999px;
  white-space: nowrap;
}

.badge--md {
  padding: 2px 10px;
  font-size: 0.75rem;
}

.badge--sm {
  padding: 1px 8px;
  font-size: 0.6875rem;
}

.badge--success {
  color: var(--color-success);
  background: var(--color-success-bg);
}

.badge--warning {
  color: var(--color-warning);
  background: var(--color-warning-bg);
}

.badge--danger {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.badge--default {
  color: var(--color-text-secondary);
  background: var(--color-bg);
}
</style>
