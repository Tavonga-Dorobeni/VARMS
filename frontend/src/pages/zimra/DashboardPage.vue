<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { getZimraDashboardStats, type ZimraDashboardStats } from '@/services/zimra.service'

const router = useRouter()
const stats = ref<ZimraDashboardStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    stats.value = await getZimraDashboardStats()
  } catch {
    // Stats will remain null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <div class="dashboard__header">
        <h2>Border Intake</h2>
        <VButton @click="router.push('/zimra/import')">Start Import</VButton>
      </div>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Today's Imports" :value="stats.today_imports" />
          <StatWidget label="Monthly Imports" :value="stats.monthly_imports" />
          <StatWidget label="Total Imports" :value="stats.total_imports" />
        </template>
      </div>

      <VCard v-if="!loading && stats?.top_dealers?.length">
        <h3 style="margin-bottom: var(--space-3)">Top Dealers This Month</h3>
        <ol class="top-dealers">
          <li v-for="(dealer, index) in stats.top_dealers" :key="dealer.id" class="top-dealers__row">
            <span class="top-dealers__rank">{{ index + 1 }}</span>
            <span class="top-dealers__name">{{ dealer.name }}</span>
            <span class="top-dealers__count tabular-nums">{{ dealer.import_count }}</span>
          </li>
        </ol>
      </VCard>
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
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

.top-dealers {
  list-style: none;
  padding: 0;
  margin: 0;
}

.top-dealers__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.top-dealers__row:last-child {
  border-bottom: none;
}

.top-dealers__rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.top-dealers__name {
  flex: 1;
  font-weight: 500;
}

.top-dealers__count {
  font-weight: 600;
  color: var(--color-text-secondary);
}
</style>
