<script setup lang="ts">
import StatWidget from '@/components/ui/StatWidget.vue'
import type { DashboardStats } from '@/services/fiu.service'

defineProps<{
  stats: DashboardStats | null
  loading: boolean
}>()
</script>

<template>
  <div class="stats-row">
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="stats-row__skeleton" />
    </template>
    <template v-else-if="stats">
      <StatWidget label="Active STRs" :value="stats.active_str_count" variant="danger" />
      <StatWidget label="Monthly Imports" :value="stats.monthly_imports" />
      <StatWidget label="Licensed Dealers" :value="stats.active_dealers" variant="success" />
      <StatWidget label="Nominee Flags" :value="stats.nominee_flags" variant="warning" />
    </template>
  </div>
</template>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
}

.stats-row__skeleton {
  height: 88px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
