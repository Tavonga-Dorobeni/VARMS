<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import VBadge from '@/components/ui/VBadge.vue'
import StatWidget from '@/components/ui/StatWidget.vue'
import { getAdminDashboardStats, type AdminDashboardStats } from '@/services/admin.service'
import { useQuery } from '@/composables/useApi'
import type { PaginatedData } from '@/types/api'
import type { AuditLog } from '@/types/models'

const router = useRouter()
const stats = ref<AdminDashboardStats | null>(null)
const loading = ref(true)
const lastRefreshed = ref('')

const { data: auditData, loading: auditLoading } = useQuery<PaginatedData<AuditLog>>(
  '/audit-logs',
  { limit: 10, sort_order: 'desc' },
)

onMounted(async () => {
  await loadStats()
})

async function loadStats() {
  loading.value = true
  try {
    stats.value = await getAdminDashboardStats()
    lastRefreshed.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    // Stats will remain null
  } finally {
    loading.value = false
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const actionVariant: Record<string, 'success' | 'info' | 'danger'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
}
</script>

<template>
  <AppShell>
    <div class="dashboard">
      <div class="dashboard__header">
        <div>
          <h2>System Overview</h2>
          <span v-if="lastRefreshed" class="text-secondary" style="font-size: 0.75rem">
            Last refreshed {{ lastRefreshed }}
          </span>
        </div>
        <div class="dashboard__actions">
          <VButton variant="secondary" @click="router.push('/admin/dealers')">Manage Dealers</VButton>
          <VButton variant="secondary" @click="router.push('/admin/users')">Manage Users</VButton>
        </div>
      </div>

      <div class="stats-row">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="stats-row__skeleton" />
        </template>
        <template v-else-if="stats">
          <StatWidget label="Total Users" :value="stats.total_users" />
          <StatWidget label="Total Dealers" :value="stats.total_dealers" />
          <StatWidget label="Total Vehicles" :value="stats.total_vehicles" />
          <StatWidget label="Total Sales" :value="stats.total_sales" />
        </template>
      </div>

      <div class="dashboard__grid">
        <VCard>
          <h3 style="margin-bottom: var(--space-3)">Dealer Status</h3>
          <div v-if="stats" class="status-rows">
            <RouterLink to="/admin/dealers?status=ACTIVE" class="status-row">
              <VBadge variant="success">Active</VBadge>
              <span class="status-row__count tabular-nums">{{ stats.active_dealers }}</span>
            </RouterLink>
            <RouterLink to="/admin/dealers?status=SUSPENDED" class="status-row">
              <VBadge variant="warning">Suspended</VBadge>
              <span class="status-row__count tabular-nums">{{ stats.suspended_dealers }}</span>
            </RouterLink>
            <RouterLink to="/admin/dealers?status=REVOKED" class="status-row">
              <VBadge variant="danger">Revoked</VBadge>
              <span class="status-row__count tabular-nums">{{ stats.total_dealers - stats.active_dealers - stats.suspended_dealers }}</span>
            </RouterLink>
          </div>
        </VCard>

        <VCard>
          <div class="widget-header">
            <h3>Recent Audit Activity</h3>
            <VButton variant="ghost" @click="router.push('/admin/audit-logs')">View All</VButton>
          </div>
          <table v-if="!auditLoading && auditData?.items?.length" class="mini-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in auditData.items" :key="log.id">
                <td>{{ formatTimestamp(log.timestamp) }}</td>
                <td>{{ (log as any).user ?? '—' }}</td>
                <td><VBadge :variant="actionVariant[log.action] ?? 'muted'">{{ log.action }}</VBadge></td>
                <td>{{ log.entity_type }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else-if="auditLoading" class="text-secondary" style="padding: var(--space-4); text-align: center">Loading...</p>
          <p v-else class="text-secondary" style="padding: var(--space-4); text-align: center">No recent activity</p>
        </VCard>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.dashboard__actions {
  display: flex;
  gap: var(--space-2);
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

.status-rows {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.status-row:hover {
  background: var(--color-bg);
}

.status-row__count {
  font-weight: 600;
  font-size: 1.125rem;
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
</style>
