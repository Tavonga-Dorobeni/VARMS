<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div :class="['v-spinner', `v-spinner--${size ?? 'md'}`]" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style scoped>
.v-spinner {
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.v-spinner--sm { width: 16px; height: 16px; }
.v-spinner--md { width: 24px; height: 24px; }
.v-spinner--lg { width: 40px; height: 40px; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
