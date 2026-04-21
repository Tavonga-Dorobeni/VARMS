<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { useAuthStore } from '@/stores/auth'
import { getDealerDashboardStats, type DealerDashboardStats } from '@/services/dealer-dashboard.service'

const router = useRouter()
const auth = useAuthStore()
const stats = ref<DealerDashboardStats | null>(null)
const loading = ref(true)

function formatCurrency(value: number): string {
  return `US$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  if (!auth.user?.dealershipId) return
  try {
    stats.value = await getDealerDashboardStats(auth.user.dealershipId)
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
        <h2>Dashboard</h2>
        <VButton @click="router.push('/dealer/sales/new')">Record New Sale</VButton>
      </div>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Vehicles in Inventory" :value="stats.inventory_count" variant="warning" />
          <StatWidget label="Vehicles Sold" :value="stats.sold_count" />
          <StatWidget label="Vehicles Registered" :value="stats.registered_count" variant="success" />
          <StatWidget label="Monthly Revenue" :value="formatCurrency(stats.monthly_sales_value)" />
        </template>
      </div>

      <div v-if="!loading && stats" class="dashboard__grid">
        <VCard>
          <h3 style="margin-bottom: var(--space-4)">Revenue Summary</h3>
          <div class="revenue">
            <div class="revenue__item">
              <span class="revenue__label text-secondary">Lifetime Revenue</span>
              <span class="revenue__value tabular-nums">{{ formatCurrency(stats.total_sales_value) }}</span>
            </div>
            <div class="revenue__item">
              <span class="revenue__label text-secondary">This Month</span>
              <span class="revenue__value revenue__value--highlight tabular-nums">{{ formatCurrency(stats.monthly_sales_value) }}</span>
            </div>
          </div>
        </VCard>

        <VCard>
          <div class="widget-header">
            <h3>Recent Sales</h3>
            <VButton variant="ghost" @click="router.push('/dealer/inventory')">View Inventory</VButton>
          </div>
          <table v-if="stats.recent_sales.length" class="mini-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>VIN</th>
                <th>Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="sale in stats.recent_sales"
                :key="sale.id"
                class="mini-table__row--clickable"
                @click="router.push(`/dealer/inventory/${sale.id}`)"
              >
                <td>{{ sale.buyer_full_name }}</td>
                <td class="font-mono">{{ sale.vehicle_vin.slice(0, 11) }}...</td>
                <td class="tabular-nums">{{ formatCurrency(sale.sale_price) }}</td>
                <td>{{ formatDate(sale.sale_date) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-secondary" style="padding: var(--space-4); text-align: center">No recent sales</p>
        </VCard>
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

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 860px) {
  .dashboard__grid { grid-template-columns: 1fr; }
}

.revenue {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.revenue__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.revenue__label {
  font-size: 0.8125rem;
}

.revenue__value {
  font-size: 1.5rem;
  font-weight: 700;
}

.revenue__value--highlight {
  color: var(--color-success);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
}

.mini-table th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.mini-table td {
  padding: var(--space-2);
  font-size: 0.8125rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.mini-table__row--clickable {
  cursor: pointer;
  transition: background var(--transition-fast);
}

.mini-table__row--clickable:hover {
  background: var(--color-bg);
}
</style>
