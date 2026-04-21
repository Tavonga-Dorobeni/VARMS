<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import AppShell from '@/layouts/AppShell.vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import VButton from '@/components/ui/VButton.vue'
import VInput from '@/components/ui/VInput.vue'
import VSelect from '@/components/ui/VSelect.vue'
import ImportFormModal from './ImportFormModal.vue'
import { listImports } from '@/services/zimra.service'
import { useDebouncedWatch } from '@/composables/useDebouncedWatch'
import { listDealers } from '@/services/dealers.service'
import { DealerStatus } from '@/types/enums'
import type { ImportRecord, Dealer } from '@/types/models'

const columns: DataTableColumn[] = [
  { key: 'vin', label: 'VIN', width: '180px' },
  { key: 'make', label: 'Make', sortable: true },
  { key: 'model', label: 'Model' },
  { key: 'declared_value', label: 'Declared Value', width: '140px' },
  { key: 'country_of_origin', label: 'Country' },
  { key: 'import_date', label: 'Import Date', sortable: true, width: '130px' },
  { key: 'border_post', label: 'Border Post' },
  { key: 'dealer', label: 'Dealer' },
]

const rows = ref<ImportRecord[]>([])
const loading = ref(false)
const total = ref(0)
const dealers = ref<Dealer[]>([])

const filters = reactive({
  page: 1,
  limit: 20,
  search: '',
  dealership_id: '' as number | string,
  date_from: '',
  date_to: '',
  sort_by: 'import_date',
  sort_order: 'desc' as 'asc' | 'desc',
})

const formOpen = ref(false)

async function fetchImports() {
  loading.value = true
  try {
    const result = await listImports(filters)
    rows.value = result.items
    total.value = result.total
  } catch {
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const result = await listDealers({ status: DealerStatus.ACTIVE, limit: 100 })
    dealers.value = result.items
  } catch {
    dealers.value = []
  }
  fetchImports()
})

useDebouncedWatch(() => filters.search, () => handleFilterChange())

function handlePageChange(page: number) {
  filters.page = page
  fetchImports()
}

function handleLimitChange(limit: number) {
  filters.limit = limit
  filters.page = 1
  fetchImports()
}

function handleFilterChange() {
  filters.page = 1
  fetchImports()
}

function handleSaved() {
  formOpen.value = false
  fetchImports()
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(value: number | string): string {
  if (value == null || value === '') return '—'
  return `US$ ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function dealerName(id: number | undefined): string {
  if (id == null) return '—'
  return dealers.value.find(d => d.id === id)?.name ?? `#${id}`
}
</script>

<template>
  <AppShell>
    <div class="page-header">
      <h2>Vehicle Imports</h2>
      <VButton @click="formOpen = true">Import Vehicle</VButton>
    </div>

    <div class="filters">
      <VInput
        v-model="filters.search"
        placeholder="Search VIN, make, model..."
        @keyup.enter="handleFilterChange"
      />
      <VSelect
        v-model="filters.dealership_id"
        :options="[{ value: '', label: 'All Dealers' }, ...dealers.map(d => ({ value: d.id, label: d.name }))]"
        placeholder="All Dealers"
        @update:model-value="handleFilterChange"
      />
      <VInput
        v-model="filters.date_from"
        type="date"
        placeholder="From"
        @change="handleFilterChange"
      />
      <VInput
        v-model="filters.date_to"
        type="date"
        placeholder="To"
        @change="handleFilterChange"
      />
    </div>

    <DataTable
      :columns="columns"
      :rows="(rows as unknown as Record<string, unknown>[])"
      :loading="loading"
      :total-items="total"
      :page="filters.page"
      :limit="filters.limit"
      @update:page="handlePageChange"
      @update:limit="handleLimitChange"
    >
      <template #cell-vin="{ row }">
        <span class="mono tabular-nums">{{ (row as unknown as ImportRecord).vehicle?.vin ?? '—' }}</span>
      </template>
      <template #cell-make="{ row }">
        {{ (row as unknown as ImportRecord).vehicle?.make ?? '—' }}
      </template>
      <template #cell-model="{ row }">
        {{ (row as unknown as ImportRecord).vehicle?.model ?? '—' }}
      </template>
      <template #cell-declared_value="{ row }">
        <span class="tabular-nums">{{ formatMoney((row as unknown as ImportRecord).vehicle?.declared_value as number | string) }}</span>
      </template>
      <template #cell-country_of_origin="{ row }">
        {{ (row as unknown as ImportRecord).vehicle?.country_of_origin ?? '—' }}
      </template>
      <template #cell-import_date="{ row }">
        {{ formatDate((row as unknown as ImportRecord).vehicle?.import_date ?? '') }}
      </template>
      <template #cell-dealer="{ row }">
        {{ dealerName((row as unknown as ImportRecord).vehicle?.dealership_id) }}
      </template>
    </DataTable>

    <ImportFormModal :open="formOpen" @close="formOpen = false" @saved="handleSaved" />
  </AppShell>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
