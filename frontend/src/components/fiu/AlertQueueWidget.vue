<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import VBadge, { type BadgeVariant } from '@/components/ui/VBadge.vue'
import VSpinner from '@/components/ui/VSpinner.vue'
import { useQuery } from '@/composables/useApi'
import type { PaginatedData } from '@/types/api'
import type { StrAlert } from '@/types/models'

const router = useRouter()

const { data, loading } = useQuery<PaginatedData<StrAlert>>(
  '/str-alerts',
  { limit: 10, sort_order: 'desc', status: 'PENDING' },
)

const alerts = computed(() => data.value?.items ?? [])

const severityVariant: Record<string, BadgeVariant> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'critical',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
</script>

<template>
  <VCard class="alert-queue">
    <div class="alert-queue__header">
      <h3>Recent Alerts</h3>
      <VButton variant="ghost" size="sm" @click="router.push({ name: 'fiu-alerts' })">
        View All
      </VButton>
    </div>

    <VSpinner v-if="loading" />

    <table v-else-if="alerts.length > 0" class="alert-queue__table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Severity</th>
          <th>Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in alerts" :key="a.id">
          <td>{{ formatDate(a.created_at) }}</td>
          <td>{{ a.alert_type.replace(/_/g, ' ') }}</td>
          <td>
            <VBadge :variant="severityVariant[a.severity] ?? 'muted'">{{ a.severity }}</VBadge>
          </td>
          <td class="tabular-nums">
            {{ a.transaction_value != null ? `US$ ${Number(a.transaction_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—' }}
          </td>
          <td>
            <VButton
              variant="ghost"
              size="sm"
              @click="router.push({ name: 'fiu-alert-detail', params: { id: a.id } })"
            >
              Review
            </VButton>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else style="color: var(--color-text-secondary); font-size: 0.875rem; text-align: center; padding: var(--space-4) 0">
      No pending alerts
    </p>
  </VCard>
</template>

<style scoped>
.alert-queue__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.alert-queue__table {
  width: 100%;
  border-collapse: collapse;
}

.alert-queue__table th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.alert-queue__table td {
  padding: var(--space-2);
  font-size: 0.8125rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

</style>
