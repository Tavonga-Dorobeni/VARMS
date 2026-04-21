<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  limit: number
  total: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:limit': [limit: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
const start = computed(() => (props.page - 1) * props.limit + 1)
const end = computed(() => Math.min(props.page * props.limit, props.total))

const visiblePages = computed(() => {
  const pages: number[] = []
  const current = props.page
  const total = totalPages.value
  const range = 2

  for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div class="pagination">
    <div class="pagination__info">
      Showing {{ start }}–{{ end }} of {{ total }}
    </div>
    <div class="pagination__controls">
      <select
        class="pagination__limit"
        :value="limit"
        @change="emit('update:limit', Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="10">10 / page</option>
        <option :value="20">20 / page</option>
        <option :value="50">50 / page</option>
      </select>
      <button
        class="pagination__btn"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        &laquo; Prev
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        :class="['pagination__btn', { 'pagination__btn--active': p === page }]"
        @click="emit('update:page', p)"
      >
        {{ p }}
      </button>
      <button
        class="pagination__btn"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        Next &raquo;
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0;
  font-size: 0.8125rem;
}

.pagination__info {
  color: var(--color-text-secondary);
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.pagination__limit {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  background: var(--color-surface);
  margin-right: var(--space-2);
  min-height: 36px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.pagination__limit:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--focus-ring);
}

.pagination__btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.8125rem;
  color: var(--color-text);
  cursor: pointer;
  min-height: 36px;
  transition: background-color var(--transition-fast), box-shadow var(--transition-fast);
}

.pagination__btn:hover:not(:disabled) {
  background: var(--color-bg);
}

.pagination__btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination__btn--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
