<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import AlertFilters from '@/components/filters/AlertFilters.vue'
import VBadge, { type BadgeVariant } from '@/components/ui/VBadge.vue'
import { usePaginatedQuery } from '@/composables/useApi'
import type { StrAlert } from '@/types/models'

const router = useRouter()

const filterStatus = ref('')
const filterSeverity = ref('')
const filterAlertType = ref('')
const filterDealership = ref('')

const { data, loading, params } = usePaginatedQuery<StrAlert>('/str-alerts')

watch([filterStatus, filterSeverity, filterAlertType, filterDealership], () => {
  params.value.page = 1
  if (filterStatus.value) params.value.status = filterStatus.value
  else delete params.value.status
  if (filterSeverity.value) params.value.severity = filterSeverity.value
  else delete params.value.severity
  if (filterAlertType.value) params.value.alert_type = filterAlertType.value
  else delete params.value.alert_type
  if (filterDealership.value) params.value.dealership_search = filterDealership.value
  else delete params.value.dealership_search
})

const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'created_at', label: 'Date', sortable: true },
  { key: 'alert_type', label: 'Type' },
  { key: 'dealership_name', label: 'Dealership' },
  { key: 'transaction_value', label: 'Value', align: 'right' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Reason' },
]

const rows = computed(() => {
  if (!data.value) return []
  return data.value.items.map(alert => ({
    ...alert,
    dealership_name: alert.dealership?.name ?? '—',
  }))
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value: number | string | null): string {
  if (value == null) return '—'
  const num = Number(value)
  if (isNaN(num)) return '—'
  return `US$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const severityVariant: Record<string, BadgeVariant> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'critical',
}

const statusVariant: Record<string, BadgeVariant> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  DISMISSED: 'muted',
  ESCALATED: 'danger',
}

const alertTypeLabels: Record<string, string> = {
  LARGE_CASH: 'Large Cash',
  NOMINEE_PATTERN: 'Nominee Pattern',
  HIGH_CASH_VOLUME: 'High Cash Volume',
  RAPID_RESALE: 'Rapid Resale',
  VALUE_MISMATCH: 'Value Mismatch',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  DISMISSED: 'Dismissed',
  ESCALATED: 'Escalated',
}

function handleRowClick(row: Record<string, unknown>) {
  router.push({ name: 'fiu-alert-detail', params: { id: row.id as number } })
}
</script>

<template>
  <AppShell>
    <h2 style="margin-bottom: var(--space-4)">STR Alerts</h2>

    <AlertFilters
      :status="filterStatus"
      :severity="filterSeverity"
      :alert-type="filterAlertType"
      :dealership-search="filterDealership"
      style="margin-bottom: var(--space-4)"
      @update:status="filterStatus = $event"
      @update:severity="filterSeverity = $event"
      @update:alert-type="filterAlertType = $event"
      @update:dealership-search="filterDealership = $event"
    />

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :total-items="data?.total"
      :page="params.page"
      :limit="params.limit"
      :sort-by="params.sort_by as string | undefined"
      :sort-order="(params.sort_order as 'asc' | 'desc' | undefined)"
      @update:page="params.page = $event"
      @update:limit="params.limit = $event"
      @row-click="handleRowClick"
    >
      <template #cell-created_at="{ value }">
        {{ formatDate(value as string) }}
      </template>

      <template #cell-alert_type="{ value }">
        {{ alertTypeLabels[value as string] ?? value }}
      </template>

      <template #cell-transaction_value="{ value }">
        <span class="tabular-nums">{{ formatCurrency(value as number | null) }}</span>
      </template>

      <template #cell-severity="{ value }">
        <VBadge :variant="severityVariant[value as string] ?? 'muted'">{{ value }}</VBadge>
      </template>

      <template #cell-status="{ value }">
        <VBadge :variant="statusVariant[value as string] ?? 'muted'">{{ statusLabels[value as string] ?? value }}</VBadge>
      </template>

      <template #cell-reason="{ value }">
        <span class="reason-cell">{{ value }}</span>
      </template>
    </DataTable>
  </AppShell>
</template>

<style scoped>
.reason-cell {
  max-width: 200px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
