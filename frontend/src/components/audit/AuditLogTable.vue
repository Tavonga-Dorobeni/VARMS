<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import VButton from '@/components/ui/VButton.vue'
import AuditLogFilters from './AuditLogFilters.vue'
import AuditLogExpandedRow from './AuditLogExpandedRow.vue'
import VBadge, { type BadgeVariant } from '@/components/ui/VBadge.vue'
import { usePaginatedQuery } from '@/composables/useApi'
import { exportAuditLogs } from '@/services/audit-logs.service'
import type { AuditLog } from '@/types/models'

const filterRole = ref('')
const filterAction = ref('')
const filterEntityType = ref('')
const filterUser = ref('')
const expandedId = ref<number | null>(null)
const exporting = ref(false)

const { data, loading, params } = usePaginatedQuery<AuditLog>('/audit-logs')

watch([filterRole, filterAction, filterEntityType, filterUser], () => {
  params.value.page = 1
  if (filterRole.value) params.value.role = filterRole.value
  else delete params.value.role
  if (filterAction.value) params.value.action = filterAction.value
  else delete params.value.action
  if (filterEntityType.value) params.value.entity_type = filterEntityType.value
  else delete params.value.entity_type
  if (filterUser.value) params.value.user_search = filterUser.value
  else delete params.value.user_search
})

const columns: DataTableColumn[] = [
  { key: 'timestamp', label: 'Timestamp', sortable: true },
  { key: 'user', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'action', label: 'Action' },
  { key: 'entity_type', label: 'Entity' },
  { key: 'entity_id', label: 'Entity ID', width: '80px' },
  { key: 'reason', label: 'Reason' },
  { key: 'expand', label: '', width: '40px' },
]

const rows = computed(() => data.value?.items ?? [])

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const actionVariant: Record<string, BadgeVariant> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
}

function toggleExpand(row: Record<string, unknown>) {
  const id = row.id as number
  expandedId.value = expandedId.value === id ? null : id
}

async function handleExport() {
  if (exporting.value) return
  exporting.value = true
  try {
    await exportAuditLogs({
      role: filterRole.value || undefined,
      action: filterAction.value || undefined,
      entity_type: filterEntityType.value || undefined,
    })
  } catch {
    // Export failed silently
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div>
    <div class="toolbar">
      <AuditLogFilters
        :role="filterRole"
        :action="filterAction"
        :entity-type="filterEntityType"
        :user-search="filterUser"
        @update:role="filterRole = $event"
        @update:action="filterAction = $event"
        @update:entity-type="filterEntityType = $event"
        @update:user-search="filterUser = $event"
      />
      <VButton variant="secondary" :disabled="exporting" :loading="exporting" @click="handleExport">
        Export CSV
      </VButton>
    </div>

    <DataTable
      :columns="columns"
      :rows="(rows as unknown as Record<string, unknown>[])"
      :loading="loading"
      expandable
      :total-items="data?.total"
      :page="params.page"
      :limit="params.limit"
      :sort-by="params.sort_by as string | undefined"
      :sort-order="(params.sort_order as 'asc' | 'desc' | undefined)"
      @update:page="params.page = $event"
      @update:limit="params.limit = $event"
      @row-click="toggleExpand"
    >
      <template #cell-timestamp="{ value }">
        {{ formatTimestamp(value as string) }}
      </template>

      <template #cell-action="{ value }">
        <VBadge :variant="actionVariant[value as string] ?? 'muted'">{{ value }}</VBadge>
      </template>

      <template #cell-reason="{ value }">
        <span class="reason-cell">{{ value ?? '—' }}</span>
      </template>

      <template #cell-expand="{ row }">
        <span class="expand-icon">{{ expandedId === (row as Record<string, unknown>).id ? '▼' : '▶' }}</span>
      </template>

      <template #expanded-row="{ row }">
        <AuditLogExpandedRow
          v-if="expandedId === (row as Record<string, unknown>).id"
          :before-value="(row as Record<string, unknown>).before_value as Record<string, unknown> | null"
          :after-value="(row as Record<string, unknown>).after_value as Record<string, unknown> | null"
        />
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.toolbar > :first-child {
  flex: 1;
}

.reason-cell {
  max-width: 180px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-icon {
  font-size: 0.625rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}
</style>
