<script setup lang="ts">
import VSpinner from '@/components/ui/VSpinner.vue'
import DataTablePagination from './DataTablePagination.vue'

export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

defineProps<{
  columns: DataTableColumn[]
  rows: Record<string, unknown>[]
  loading?: boolean
  totalItems?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  expandable?: boolean
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:limit': [limit: number]
  'update:sortBy': [key: string]
  'update:sortOrder': [order: 'asc' | 'desc']
  'row-click': [row: Record<string, unknown>]
}>()

function handleSort(column: DataTableColumn) {
  if (!column.sortable) return
  emit('update:sortBy', column.key)
  emit('update:sortOrder', column.key === undefined ? 'asc' : 'desc')
}
</script>

<template>
  <div class="data-table-wrapper">
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['data-table__th', { 'data-table__th--sortable': col.sortable }]"
              :style="col.width ? { width: col.width } : undefined"
              @click="handleSort(col)"
            >
              <span>{{ col.label }}</span>
              <span v-if="col.sortable && sortBy === col.key" class="data-table__sort">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr>
              <td :colspan="columns.length" class="data-table__loading">
                <VSpinner />
              </td>
            </tr>
          </template>
          <template v-else-if="rows.length === 0">
            <tr>
              <td :colspan="columns.length" class="data-table__empty">
                No records found
              </td>
            </tr>
          </template>
          <template v-else>
            <template v-for="(row, rowIndex) in rows" :key="rowIndex">
              <tr
                class="data-table__row"
                @click="$emit('row-click', row)"
              >
                <td
                  v-for="col in columns"
                  :key="col.key"
                  :class="['data-table__td', col.align ? `data-table__td--${col.align}` : '']"
                >
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                    {{ row[col.key] ?? '—' }}
                  </slot>
                </td>
              </tr>
              <tr v-if="expandable" class="data-table__expanded">
                <td :colspan="columns.length">
                  <slot name="expanded-row" :row="row" />
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <DataTablePagination
      v-if="totalItems != null && page != null && limit != null"
      :page="page"
      :limit="limit"
      :total="totalItems"
      @update:page="emit('update:page', $event)"
      @update:limit="emit('update:limit', $event)"
    />
  </div>
</template>

<style scoped>
.data-table-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.data-table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table__th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  white-space: nowrap;
  user-select: none;
}

.data-table__th--sortable {
  cursor: pointer;
}

.data-table__th--sortable:hover {
  color: var(--color-text);
}

.data-table__sort {
  margin-left: var(--space-1);
  font-size: 0.625rem;
}

.data-table__td {
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.data-table__td--center { text-align: center; }
.data-table__td--right { text-align: right; }

.data-table__row {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.data-table__row:nth-child(even) {
  background: rgba(248, 250, 252, 0.5);
}

.data-table__row:hover {
  background: rgba(15, 23, 42, 0.04);
}

.data-table__loading,
.data-table__empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-text-secondary);
}

.data-table__loading {
  display: flex;
  justify-content: center;
}

.data-table__expanded td {
  padding: 0;
  border-bottom: 1px solid var(--color-border);
}

:deep(.pagination) {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
}
</style>
