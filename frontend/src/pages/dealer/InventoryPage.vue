<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import StatusFilter from '@/components/filters/StatusFilter.vue'
import DateRangeFilter from '@/components/filters/DateRangeFilter.vue'
import { useAuthStore } from '@/stores/auth'
import { listInventory } from '@/services/vehicles.service'
import type { Vehicle } from '@/types/models'

const auth = useAuthStore()
const router = useRouter()

const columns: DataTableColumn[] = [
  { key: 'vin', label: 'VIN', sortable: true },
  { key: 'make', label: 'Make', sortable: true },
  { key: 'model', label: 'Model' },
  { key: 'declared_value', label: 'Declared Value', align: 'right', sortable: true },
  { key: 'import_date', label: 'Import Date', sortable: true },
  { key: 'status', label: 'Status', width: '130px' },
]

const rows = ref<Vehicle[]>([])
const loading = ref(false)
const total = ref(0)

const filters = reactive({
  page: 1,
  limit: 20,
  status: '',
  from_date: '',
  to_date: '',
  sort_by: 'created_at',
  sort_order: 'desc' as 'asc' | 'desc',
})

async function fetchInventory() {
  if (!auth.user?.dealershipId) return
  loading.value = true
  try {
    const params: Record<string, unknown> = { ...filters }
    if (!params.status) delete params.status
    if (!params.from_date) delete params.from_date
    if (!params.to_date) delete params.to_date
    const result = await listInventory(auth.user.dealershipId, params)
    rows.value = result.items
    total.value = result.total
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

fetchInventory()

function handleFilterChange() {
  filters.page = 1
  fetchInventory()
}

function handleRowClick(row: Record<string, unknown>) {
  router.push(`/dealer/inventory/${(row as unknown as Vehicle).id}`)
}

function formatCurrency(value: unknown): string {
  const num = Number(value)
  if (isNaN(num)) return '—'
  return `US$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: unknown): string {
  if (!dateStr) return '—'
  return new Date(dateStr as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <AppShell>
    <h2 style="margin-bottom: var(--space-6)">Vehicle Inventory</h2>

    <div class="filters">
      <StatusFilter v-model="filters.status" @update:model-value="handleFilterChange" />
      <DateRangeFilter
        :from-date="filters.from_date"
        :to-date="filters.to_date"
        @update:from-date="(v) => { filters.from_date = v; handleFilterChange() }"
        @update:to-date="(v) => { filters.to_date = v; handleFilterChange() }"
      />
    </div>

    <DataTable
      :columns="columns"
      :rows="(rows as unknown as Record<string, unknown>[])"
      :loading="loading"
      :total-items="total"
      :page="filters.page"
      :limit="filters.limit"
      @update:page="(p) => { filters.page = p; fetchInventory() }"
      @update:limit="(l) => { filters.limit = l; filters.page = 1; fetchInventory() }"
      @row-click="handleRowClick"
    >
      <template #cell-vin="{ value }">
        <span class="font-mono">{{ value }}</span>
      </template>
      <template #cell-declared_value="{ value }">
        <span class="tabular-nums">{{ formatCurrency(value) }}</span>
      </template>
      <template #cell-import_date="{ value }">
        {{ formatDate(value) }}
      </template>
      <template #cell-status="{ value }">
        <StatusBadge :status="(value as string)" />
      </template>
    </DataTable>
  </AppShell>
</template>

<style scoped>
.filters {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  align-items: flex-end;
}
</style>
