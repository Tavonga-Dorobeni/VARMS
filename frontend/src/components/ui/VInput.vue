<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  required?: boolean
  type?: string
  placeholder?: string
  modelValue?: string | number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="v-input">
    <label v-if="label" class="v-input__label">
      {{ label }}
      <span v-if="required" class="v-input__required">*</span>
    </label>
    <input
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :value="modelValue"
      :class="['v-input__field', { 'v-input__field--error': error }]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="v-input__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.v-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.v-input__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.v-input__required {
  color: var(--color-danger);
}

.v-input__field {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.875rem;
  min-height: 40px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.v-input__field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--focus-ring);
}

.v-input__field--error {
  border-color: var(--color-danger);
}

.v-input__error {
  font-size: 0.75rem;
  color: var(--color-danger);
}
</style>
