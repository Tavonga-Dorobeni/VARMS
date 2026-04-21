<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :class="['v-btn', `v-btn--${variant ?? 'primary'}`]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="v-btn__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.v-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.5;
  min-height: 40px;
  transition: background-color var(--transition-fast), opacity var(--transition-fast), box-shadow var(--transition-fast);
  white-space: nowrap;
}

.v-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.v-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.v-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.v-btn--primary {
  background-color: var(--color-primary);
  color: white;
}
.v-btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.v-btn--secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.v-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-bg);
}

.v-btn--danger {
  background-color: var(--color-danger);
  color: white;
}
.v-btn--danger:hover:not(:disabled) {
  opacity: 0.9;
}

.v-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.v-btn--ghost:hover:not(:disabled) {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.v-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
