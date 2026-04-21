<script setup lang="ts">
import VSelect from '@/components/ui/VSelect.vue'
import VInput from '@/components/ui/VInput.vue'
import { StrSeverity, StrStatus } from '@/types/enums'

defineProps<{
  status: string
  severity: string
  alertType: string
  dealershipSearch: string
}>()

defineEmits<{
  'update:status': [value: string]
  'update:severity': [value: string]
  'update:alertType': [value: string]
  'update:dealershipSearch': [value: string]
}>()

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: StrStatus.PENDING, label: 'Pending' },
  { value: StrStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: StrStatus.DISMISSED, label: 'Dismissed' },
  { value: StrStatus.ESCALATED, label: 'Escalated' },
]

const severityOptions = [
  { value: '', label: 'All Severities' },
  { value: StrSeverity.LOW, label: 'Low' },
  { value: StrSeverity.MEDIUM, label: 'Medium' },
  { value: StrSeverity.HIGH, label: 'High' },
  { value: StrSeverity.CRITICAL, label: 'Critical' },
]

const alertTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'LARGE_CASH', label: 'Large Cash' },
  { value: 'NOMINEE_PATTERN', label: 'Nominee Pattern' },
  { value: 'HIGH_CASH_VOLUME', label: 'High Cash Volume' },
  { value: 'RAPID_RESALE', label: 'Rapid Resale' },
  { value: 'VALUE_MISMATCH', label: 'Value Mismatch' },
]
</script>

<template>
  <div class="alert-filters">
    <VSelect
      :model-value="status"
      label="Status"
      :options="statusOptions"
      @update:model-value="$emit('update:status', $event)"
    />
    <VSelect
      :model-value="severity"
      label="Severity"
      :options="severityOptions"
      @update:model-value="$emit('update:severity', $event)"
    />
    <VSelect
      :model-value="alertType"
      label="Alert Type"
      :options="alertTypeOptions"
      @update:model-value="$emit('update:alertType', $event)"
    />
    <VInput
      :model-value="dealershipSearch"
      label="Dealership"
      placeholder="Search by name..."
      @update:model-value="$emit('update:dealershipSearch', $event)"
    />
  </div>
</template>

<style scoped>
.alert-filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: flex-end;
}

.alert-filters > * {
  min-width: 160px;
  flex: 1;
}
</style>
