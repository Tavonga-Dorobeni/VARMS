<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VInput from '@/components/ui/VInput.vue'
import VButton from '@/components/ui/VButton.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { getCvrDashboardStats, type CvrDashboardStats } from '@/services/cvr.service'

const router = useRouter()
const stats = ref<CvrDashboardStats | null>(null)
const loading = ref(true)
const searchVin = ref('')
const searchNationalId = ref('')

onMounted(async () => {
  try {
    stats.value = await getCvrDashboardStats()
  } catch {
    // Stats will remain null
  } finally {
    loading.value = false
  }
})

function handleSearch() {
  if (!searchVin.value.trim() || !searchNationalId.value.trim()) return
  router.push({
    name: 'cvr-register',
    query: {
      vin: searchVin.value.trim().toUpperCase(),
      national_id: searchNationalId.value.trim(),
    },
  })
}
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <h2 style="margin-bottom: var(--space-4)">Vehicle Registration</h2>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Today's Registrations" :value="stats.today_registrations" />
          <StatWidget label="Monthly Registrations" :value="stats.monthly_registrations" />
          <StatWidget label="Pending Vehicles" :value="stats.pending_vehicles" variant="warning" />
        </template>
      </div>

      <VCard class="search-section">
        <h3 style="margin-bottom: var(--space-4)">Search Vehicle</h3>
        <div class="search-form">
          <VInput
            v-model="searchVin"
            label="VIN"
            placeholder="Enter 17-character VIN"
            required
            @keydown.enter="handleSearch"
          />
          <VInput
            v-model="searchNationalId"
            label="Requester National ID"
            placeholder="Enter national ID"
            required
            @keydown.enter="handleSearch"
          />
          <VButton
            :disabled="!searchVin.trim() || !searchNationalId.trim()"
            @click="handleSearch"
          >
            Search
          </VButton>
        </div>
      </VCard>
    </div>
  </AppShell>
</template>

<style scoped>
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

.search-section {
  max-width: 520px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
