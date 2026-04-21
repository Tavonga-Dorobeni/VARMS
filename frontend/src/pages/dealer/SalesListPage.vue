<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import VButton from '@/components/ui/VButton.vue'
import VInput from '@/components/ui/VInput.vue'
import VSelect from '@/components/ui/VSelect.vue'
import { listSales } from '@/services/sales.service'
import { useDebouncedWatch } from '@/composables/useDebouncedWatch'
import { useAuthStore } from '@/stores/auth'
import { PaymentType } from '@/types/enums'
import type { SaleTransaction } from '@/types/models'

const router = useRouter()
const auth = useAuthStore()

const columns: DataTableColumn[] = [
  { key: 'sale_date', label: 'Sale Date', sortable: true, width: '130px' },
  { key: 'vin', label: 'VIN', width: '180px' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'buyer', label: 'Buyer' },
  { key: 'national_id', label: 'National ID', width: '150px' },
  { key: 'sale_price', label: 'Price', width: '140px' },
  { key: 'payment_type', label: 'Payment', width: '130px' },
]

const rows = ref<SaleTransaction[]>([])
const loading = ref(false)
const total = ref(0)

const filters = reactive({
  page: 1,
  limit: 20,
  search: '',
  payment_type: '' as PaymentType | '',
  date_from: '',
  date_to: '',
  dealership_id: auth.user?.dealershipId ?? undefined,
  sort_by: 'sale_date',
  sort_order: 'desc' as 'asc' | 'desc',
})

const paymentOptions = [
  { value: '', label: 'All Payments' },
  { value: PaymentType.CASH, label: 'Cash' },
  { value: PaymentType.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PaymentType.FINANCE, label: 'Finance' },
]

async function fetchSales() {
  loading.value = true
  try {
    const result = await listSales(filters)
    rows.value = result.items
    total.value = result.total
  } catch {
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(fetchSales)

useDebouncedWatch(() => filters.search, () => handleFilterChange())

function handlePageChange(page: number) {
  filters.page = page
  fetchSales()
}

function handleLimitChange(limit: number) {
  filters.limit = limit
  filters.page = 1
  fetchSales()
}

function handleFilterChange() {
  filters.page = 1
  fetchSales()
}

function openCreate() {
  router.push('/dealer/sales/new')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(value: number | string): string {
  if (value == null || value === '') return '—'
  return `US$ ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function paymentLabel(t: PaymentType): string {
  if (t === PaymentType.CASH) return 'Cash'
  if (t === PaymentType.BANK_TRANSFER) return 'Bank Transfer'
  if (t === PaymentType.FINANCE) return 'Finance'
  return t
}
</script>

<template>
  <AppShell>
    <div class="page-header">
      <h2>Sales</h2>
      <VButton @click="openCreate">Record Sale</VButton>
    </div>

    <div class="filters">
      <VInput
        v-model="filters.search"
        placeholder="Search VIN, buyer, national ID..."
        @keyup.enter="handleFilterChange"
      />
      <VSelect
        v-model="filters.payment_type"
        :options="paymentOptions"
        placeholder="All Payments"
        @update:model-value="handleFilterChange"
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
      <template #cell-sale_date="{ value }">
        {{ formatDate(value as string) }}
      </template>
      <template #cell-vin="{ row }">
        <span class="mono tabular-nums">{{ (row as unknown as SaleTransaction).vehicle?.vin ?? '—' }}</span>
      </template>
      <template #cell-vehicle="{ row }">
        <template v-if="(row as unknown as SaleTransaction).vehicle">
          {{ (row as unknown as SaleTransaction).vehicle!.make }} {{ (row as unknown as SaleTransaction).vehicle!.model }}
        </template>
        <template v-else>—</template>
      </template>
      <template #cell-buyer="{ row }">
        {{ (row as unknown as SaleTransaction).buyer?.full_name ?? '—' }}
      </template>
      <template #cell-national_id="{ row }">
        {{ (row as unknown as SaleTransaction).buyer?.national_id ?? '—' }}
      </template>
      <template #cell-sale_price="{ value }">
        <span class="tabular-nums">{{ formatMoney(value as number | string) }}</span>
      </template>
      <template #cell-payment_type="{ value }">
        {{ paymentLabel(value as PaymentType) }}
      </template>
    </DataTable>
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
  grid-template-columns: 2fr 1.2fr 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
