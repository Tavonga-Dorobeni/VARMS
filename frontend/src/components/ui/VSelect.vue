<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  required?: boolean
  options: { value: string | number; label: string }[]
  placeholder?: string
  modelValue?: string | number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="v-select">
    <label v-if="label" class="v-select__label">
      {{ label }}
      <span v-if="required" class="v-select__required">*</span>
    </label>
    <select
      :value="modelValue"
      :class="['v-select__field', { 'v-select__field--error': error }]"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <span v-if="error" class="v-select__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.v-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.v-select__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.v-select__required {
  color: var(--color-danger);
}

.v-select__field {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.875rem;
  min-height: 40px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.v-select__field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--focus-ring);
}

.v-select__field--error {
  border-color: var(--color-danger);
}

.v-select__error {
  font-size: 0.75rem;
  color: var(--color-danger);
}
</style>
