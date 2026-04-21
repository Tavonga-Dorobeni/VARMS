<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="v-modal__overlay" @click.self="$emit('close')">
        <div class="v-modal__content" role="dialog" aria-modal="true">
          <div v-if="title" class="v-modal__header">
            <h3>{{ title }}</h3>
            <button class="v-modal__close" @click="$emit('close')" aria-label="Close">
              &times;
            </button>
          </div>
          <div class="v-modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.v-modal__overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}

.v-modal__content {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.v-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.v-modal__header h3 {
  margin: 0;
}

.v-modal__close {
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.v-modal__close:hover {
  color: var(--color-text);
  background: var(--color-bg);
}
.v-modal__close:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.v-modal__body {
  padding: var(--space-6);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
