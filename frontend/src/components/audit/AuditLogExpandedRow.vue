<script setup lang="ts">
defineProps<{
  beforeValue: Record<string, unknown> | null
  afterValue: Record<string, unknown> | null
}>()
</script>

<template>
  <div class="expanded-row">
    <div v-if="beforeValue" class="expanded-row__section">
      <h5>Before</h5>
      <pre class="expanded-row__json">{{ JSON.stringify(beforeValue, null, 2) }}</pre>
    </div>
    <div v-if="afterValue" class="expanded-row__section">
      <h5>After</h5>
      <pre class="expanded-row__json">{{ JSON.stringify(afterValue, null, 2) }}</pre>
    </div>
    <p
      v-if="!beforeValue && !afterValue"
      style="color: var(--color-text-secondary); font-size: 0.8125rem; padding: var(--space-3)"
    >
      No change data available
    </p>
  </div>
</template>

<style scoped>
.expanded-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg);
}

.expanded-row__section h5 {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.expanded-row__json {
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  overflow-x: auto;
  max-height: 200px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
