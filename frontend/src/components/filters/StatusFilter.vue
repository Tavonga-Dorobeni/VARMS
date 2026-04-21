<script setup lang="ts">
import { VehicleStatus } from '@/types/enums'

defineProps<{
  modelValue?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const options = [
  { value: '', label: 'All Statuses' },
  { value: VehicleStatus.INVENTORY, label: 'In Inventory' },
  { value: VehicleStatus.SOLD, label: 'Sold' },
  { value: VehicleStatus.REGISTERED, label: 'Registered' },
  { value: VehicleStatus.STR_FLAGGED, label: 'STR Flagged' },
]
</script>

<template>
  <select
    class="status-filter"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
.status-filter {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  background: var(--color-surface);
  min-height: 36px;
}

.status-filter:focus {
  outline: none;
  border-color: var(--color-border-focus);
}
</style>
