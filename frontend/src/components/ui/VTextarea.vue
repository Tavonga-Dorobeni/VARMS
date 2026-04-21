<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  required?: boolean
  placeholder?: string
  modelValue?: string
  rows?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="v-textarea">
    <label v-if="label" class="v-textarea__label">
      {{ label }}
      <span v-if="required" class="v-textarea__required">*</span>
    </label>
    <textarea
      :placeholder="placeholder"
      :value="modelValue"
      :rows="rows ?? 3"
      :class="['v-textarea__field', { 'v-textarea__field--error': error }]"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <span v-if="error" class="v-textarea__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.v-textarea {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.v-textarea__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.v-textarea__required {
  color: var(--color-danger);
}

.v-textarea__field {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.v-textarea__field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: var(--focus-ring);
}

.v-textarea__field--error {
  border-color: var(--color-danger);
}

.v-textarea__error {
  font-size: 0.75rem;
  color: var(--color-danger);
}
</style>
