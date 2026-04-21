<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppShell from '@/layouts/AppShell.vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import AuditReasonModal from '@/components/shared/AuditReasonModal.vue'
import VButton from '@/components/ui/VButton.vue'
import VInput from '@/components/ui/VInput.vue'
import VSelect from '@/components/ui/VSelect.vue'
import DealerFormModal from './DealerFormModal.vue'
import { listDealers, createDealer, updateDealer, updateDealerStatus } from '@/services/dealers.service'
import { useDebouncedWatch } from '@/composables/useDebouncedWatch'
import type { Dealer } from '@/types/models'
import { DealerStatus } from '@/types/enums'

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'license_number', label: 'License Number' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'contact_info', label: 'Contact' },
  { key: 'approved_at', label: 'Approved', sortable: true, width: '120px' },
  { key: 'actions', label: '', width: '140px' },
]

const rows = ref<Dealer[]>([])
const loading = ref(false)
const total = ref(0)

const filters = reactive({
  page: 1,
  limit: 20,
  status: '' as DealerStatus | '',
  search: '',
  sort_by: 'created_at',
  sort_order: 'desc' as 'asc' | 'desc',
})

const formOpen = ref(false)
const editingDealer = ref<Dealer | null>(null)

const statusModalOpen = ref(false)
const statusTarget = ref<{ dealer: Dealer; newStatus: DealerStatus } | null>(null)
const statusLoading = ref(false)

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: DealerStatus.ACTIVE, label: 'Active' },
  { value: DealerStatus.SUSPENDED, label: 'Suspended' },
  { value: DealerStatus.REVOKED, label: 'Revoked' },
]

async function fetchDealers() {
  loading.value = true
  try {
    const result = await listDealers(filters)
    rows.value = result.items
    total.value = result.total
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

fetchDealers()

useDebouncedWatch(() => filters.search, () => handleSearch())

function handlePageChange(page: number) {
  filters.page = page
  fetchDealers()
}

function handleLimitChange(limit: number) {
  filters.limit = limit
  filters.page = 1
  fetchDealers()
}

function handleSearch() {
  filters.page = 1
  fetchDealers()
}

function openCreate() {
  editingDealer.value = null
  formOpen.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingDealer.value = row as unknown as Dealer
  formOpen.value = true
}

async function handleSave(data: { name: string; license_number: string; address: string; contact_info: string; approved_at: string }) {
  try {
    if (editingDealer.value) {
      await updateDealer(editingDealer.value.id, data)
    } else {
      await createDealer(data)
    }
    formOpen.value = false
    fetchDealers()
  } catch {
    // Errors handled by API layer
  }
}

function openStatusChange(dealer: Dealer, newStatus: DealerStatus) {
  statusTarget.value = { dealer, newStatus }
  statusModalOpen.value = true
}

async function handleStatusConfirm(reason: string) {
  if (!statusTarget.value) return
  statusLoading.value = true
  try {
    await updateDealerStatus(statusTarget.value.dealer.id, {
      status: statusTarget.value.newStatus,
      reason,
    })
    statusModalOpen.value = false
    fetchDealers()
  } catch {
    // Errors handled by API layer
  } finally {
    statusLoading.value = false
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getNextStatus(current: DealerStatus): { label: string; status: DealerStatus } | null {
  if (current === DealerStatus.ACTIVE) return { label: 'Suspend', status: DealerStatus.SUSPENDED }
  if (current === DealerStatus.SUSPENDED) return { label: 'Activate', status: DealerStatus.ACTIVE }
  if (current === DealerStatus.REVOKED) return { label: 'Activate', status: DealerStatus.ACTIVE }
  return null
}
</script>

<template>
  <AppShell>
    <div class="page-header">
      <h2>Dealer Registry</h2>
      <VButton @click="openCreate">Create Dealer</VButton>
    </div>

    <div class="filters">
      <VInput
        v-model="filters.search"
        placeholder="Search dealers..."
        @keyup.enter="handleSearch"
      />
      <VSelect
        v-model="filters.status"
        :options="statusOptions"
        placeholder="All Statuses"
        @update:model-value="handleSearch"
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
      @row-click="openEdit"
    >
      <template #cell-status="{ value }">
        <StatusBadge :status="(value as string)" />
      </template>
      <template #cell-approved_at="{ value }">
        {{ formatDate(value as string) }}
      </template>
      <template #cell-actions="{ row }">
        <template v-if="getNextStatus((row as unknown as Dealer).status)">
          <VButton
            variant="ghost"
            @click.stop="openStatusChange(row as unknown as Dealer, getNextStatus((row as unknown as Dealer).status)!.status)"
          >
            {{ getNextStatus((row as unknown as Dealer).status)!.label }}
          </VButton>
        </template>
      </template>
    </DataTable>

    <DealerFormModal
      :open="formOpen"
      :dealer="editingDealer"
      @save="handleSave"
      @close="formOpen = false"
    />

    <AuditReasonModal
      :open="statusModalOpen"
      :title="`Reason for ${statusTarget?.newStatus === DealerStatus.SUSPENDED ? 'Suspension' : 'Status Change'}`"
      :action-label="statusTarget?.newStatus === DealerStatus.SUSPENDED ? 'Suspend' : 'Confirm'"
      :destructive="statusTarget?.newStatus === DealerStatus.SUSPENDED || statusTarget?.newStatus === DealerStatus.REVOKED"
      :loading="statusLoading"
      @confirm="handleStatusConfirm"
      @cancel="statusModalOpen = false"
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
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  max-width: 500px;
}
</style>
