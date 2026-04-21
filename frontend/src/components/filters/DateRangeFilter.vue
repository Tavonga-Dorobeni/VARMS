<script setup lang="ts">
defineProps<{
  fromDate?: string
  toDate?: string
}>()

defineEmits<{
  'update:fromDate': [value: string]
  'update:toDate': [value: string]
}>()
</script>

<template>
  <div class="date-range">
    <div class="date-range__field">
      <label class="date-range__label">From</label>
      <input
        type="date"
        class="date-range__input"
        :value="fromDate"
        @input="$emit('update:fromDate', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="date-range__field">
      <label class="date-range__label">To</label>
      <input
        type="date"
        class="date-range__input"
        :value="toDate"
        @input="$emit('update:toDate', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.date-range {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.date-range__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-range__label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.date-range__input {
  padding: var(--space-2) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  background: var(--color-surface);
  min-height: 36px;
}

.date-range__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
}
</style>
