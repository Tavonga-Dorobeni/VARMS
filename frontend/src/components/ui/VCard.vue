<script setup lang="ts">
defineProps<{
  padding?: boolean
}>()
</script>

<template>
  <div :class="['v-card', { 'v-card--padded': padding !== false }]">
    <slot />
  </div>
</template>

<style scoped>
.v-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
  padding: var(--space-5) var(--space-6);
}

.v-card--padded {
  padding: var(--space-6) var(--space-8);
}
</style>
