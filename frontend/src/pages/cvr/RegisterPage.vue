<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import VButton from '@/components/ui/VButton.vue'
import VInput from '@/components/ui/VInput.vue'
import RegisterVehicleModal from './RegisterVehicleModal.vue'
import { listRegistrations } from '@/services/registration.service'
import { useDebouncedWatch } from '@/composables/useDebouncedWatch'
import type { RegistrationRecord } from '@/types/models'

const route = useRoute()

const columns: DataTableColumn[] = [
  { key: 'registration_date', label: 'Registered', sortable: true, width: '140px' },
  { key: 'vin', label: 'VIN', width: '180px' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'buyer_name', label: 'Owner' },
  { key: 'national_id', label: 'National ID', width: '160px' },
  { key: 'status', label: 'Status', width: '120px' },
]

const rows = ref<RegistrationRecord[]>([])
const loading = ref(false)
const total = ref(0)

const filters = reactive({
  page: 1,
  limit: 20,
  search: '',
  date_from: '',
  date_to: '',
  sort_by: 'registration_date',
  sort_order: 'desc' as 'asc' | 'desc',
})

const formOpen = ref(false)
const prefillVin = ref('')
const prefillNid = ref('')

async function fetchRegistrations() {
  loading.value = true
  try {
    const result = await listRegistrations(filters)
    rows.value = result.items
    total.value = result.total
  } catch {
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const queryVin = route.query.vin as string | undefined
  const queryNid = route.query.national_id as string | undefined
  if (queryVin && queryNid) {
    prefillVin.value = queryVin
    prefillNid.value = queryNid
    formOpen.value = true
  }
  fetchRegistrations()
})

useDebouncedWatch(() => filters.search, () => handleFilterChange())

function handlePageChange(page: number) {
  filters.page = page
  fetchRegistrations()
}

function handleLimitChange(limit: number) {
  filters.limit = limit
  filters.page = 1
  fetchRegistrations()
}

function handleFilterChange() {
  filters.page = 1
  fetchRegistrations()
}

function openCreate() {
  prefillVin.value = ''
  prefillNid.value = ''
  formOpen.value = true
}

function handleSaved() {
  fetchRegistrations()
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <AppShell>
    <div class="page-header">
      <h2>Registered Vehicles</h2>
      <VButton @click="openCreate">Register Vehicle</VButton>
    </div>

    <div class="filters">
      <VInput
        v-model="filters.search"
        placeholder="Search VIN, owner, national ID..."
        @keyup.enter="handleFilterChange"
      />
      <VInput v-model="filters.date_from" type="date" @change="handleFilterChange" />
      <VInput v-model="filters.date_to" type="date" @change="handleFilterChange" />
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
      <template #cell-registration_date="{ value }">
        {{ formatDate(value as string) }}
      </template>
      <template #cell-vin="{ row }">
        <span class="mono tabular-nums">{{ (row as unknown as RegistrationRecord).vehicle?.vin ?? '—' }}</span>
      </template>
      <template #cell-vehicle="{ row }">
        <template v-if="(row as unknown as RegistrationRecord).vehicle">
          {{ (row as unknown as RegistrationRecord).vehicle!.make }} {{ (row as unknown as RegistrationRecord).vehicle!.model }}
        </template>
        <template v-else>—</template>
      </template>
      <template #cell-buyer_name="{ row }">
        {{ (row as unknown as RegistrationRecord).buyer?.full_name ?? '—' }}
      </template>
      <template #cell-national_id="{ row }">
        {{ (row as unknown as RegistrationRecord).buyer?.national_id ?? '—' }}
      </template>
      <template #cell-status="{ value }">
        <span class="status-text">{{ value }}</span>
      </template>
    </DataTable>

    <RegisterVehicleModal
      :open="formOpen"
      :initial-vin="prefillVin"
      :initial-national-id="prefillNid"
      @close="formOpen = false"
      @saved="handleSaved"
    />
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
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  max-width: 720px;
}

.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}

.status-text {
  text-transform: capitalize;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}
</style>
