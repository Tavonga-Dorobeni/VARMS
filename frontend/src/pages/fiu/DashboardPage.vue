<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppShell from '@/layouts/AppShell.vue'
import VButton from '@/components/ui/VButton.vue'
import StatsRow from '@/components/fiu/StatsRow.vue'
import AlertQueueWidget from '@/components/fiu/AlertQueueWidget.vue'
import TrendChart from '@/components/fiu/TrendChart.vue'
import { getDashboardStats, getTrends } from '@/services/fiu.service'
import type { DashboardStats, TrendsData } from '@/services/fiu.service'

const stats = ref<DashboardStats | null>(null)
const statsLoading = ref(true)
const trends = ref<TrendsData | null>(null)
const trendsLoading = ref(true)

let refreshInterval: ReturnType<typeof setInterval> | null = null

async function loadStats() {
  statsLoading.value = true
  try {
    stats.value = await getDashboardStats()
  } catch {
    // Stats will show as skeleton
  } finally {
    statsLoading.value = false
  }
}

async function loadTrends() {
  trendsLoading.value = true
  try {
    trends.value = await getTrends()
  } catch {
    // Chart will show empty state
  } finally {
    trendsLoading.value = false
  }
}

async function refresh() {
  await Promise.all([loadStats(), loadTrends()])
}

onMounted(() => {
  refresh()
  refreshInterval = setInterval(loadStats, 30_000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <div class="dashboard__header">
        <h2>FIU Dashboard</h2>
        <VButton variant="secondary" @click="refresh">Refresh</VButton>
      </div>

      <StatsRow :stats="stats" :loading="statsLoading" />

      <div class="dashboard__grid">
        <TrendChart :trends="trends" :loading="trendsLoading" />
        <AlertQueueWidget />
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

@media (max-width: 960px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}
</style>
