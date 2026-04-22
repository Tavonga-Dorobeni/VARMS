<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import VSelect from '@/components/ui/VSelect.vue'
import VTextarea from '@/components/ui/VTextarea.vue'
import VSpinner from '@/components/ui/VSpinner.vue'
import VBadge, { type BadgeVariant } from '@/components/ui/VBadge.vue'
import { getAlertById, updateAlertStatus } from '@/services/str-alerts.service'
import { StrStatus } from '@/types/enums'
import type { StrAlert } from '@/types/models'

const route = useRoute()
const router = useRouter()

const alert = ref<StrAlert | null>(null)
const loading = ref(true)
const loadError = ref('')

const newStatus = ref('')
const reason = ref('')
const updating = ref(false)
const updateError = ref('')

const statusOptions = [
  { value: StrStatus.PENDING, label: 'Pending' },
  { value: StrStatus.UNDER_REVIEW, label: 'Under Review' },
  { value: StrStatus.DISMISSED, label: 'Dismissed' },
  { value: StrStatus.ESCALATED, label: 'Escalated' },
]

const severityVariant: Record<string, BadgeVariant> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'critical',
}

const statusVariant: Record<string, BadgeVariant> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  DISMISSED: 'muted',
  ESCALATED: 'danger',
}

const alertTypeLabels: Record<string, string> = {
  LARGE_CASH: 'Large Cash Transaction',
  NOMINEE_PATTERN: 'Nominee Pattern Detected',
  HIGH_CASH_VOLUME: 'High Cash Volume',
  RAPID_RESALE: 'Rapid Resale',
  VALUE_MISMATCH: 'Value Mismatch',
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    alert.value = await getAlertById(id)
    newStatus.value = alert.value.status
  } catch {
    loadError.value = 'Failed to load alert details.'
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(value: number | string | null): string {
  if (value == null) return '—'
  const num = Number(value)
  if (isNaN(num)) return '—'
  return `US$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

async function handleStatusUpdate() {
  if (!alert.value || updating.value) return
  if (!reason.value.trim()) return
  if (newStatus.value === alert.value.status) return

  updating.value = true
  updateError.value = ''
  try {
    alert.value = await updateAlertStatus(alert.value.id, newStatus.value as StrStatus, reason.value)
    reason.value = ''
  } catch {
    updateError.value = 'Failed to update status.'
  } finally {
    updating.value = false
  }
}

const canUpdate = () => {
  return alert.value && newStatus.value !== alert.value.status && reason.value.trim() !== ''
}
</script>

<template>
  <AppShell>
    <div class="detail-page">
      <VButton variant="ghost" style="margin-bottom: var(--space-3)" @click="router.push({ name: 'fiu-alerts' })">
        &larr; Back to Alerts
      </VButton>

      <VSpinner v-if="loading" />
      <p v-else-if="loadError" style="color: var(--color-danger)">{{ loadError }}</p>

      <template v-else-if="alert">
        <div class="detail-header">
          <h2>Alert #{{ alert.id }}</h2>
          <div class="detail-header__badges">
            <VBadge :variant="severityVariant[alert.severity] ?? 'muted'">{{ alert.severity }}</VBadge>
            <VBadge :variant="statusVariant[alert.status] ?? 'muted'">{{ alert.status.replace('_', ' ') }}</VBadge>
          </div>
        </div>

        <div class="detail-grid">
          <VCard>
            <h4 style="margin-bottom: var(--space-3)">Alert Information</h4>
            <dl class="detail-list">
              <div class="detail-list__row">
                <dt>Type</dt>
                <dd>{{ alertTypeLabels[alert.alert_type] ?? alert.alert_type }}</dd>
              </div>
              <div class="detail-list__row">
                <dt>Reason</dt>
                <dd>{{ alert.reason }}</dd>
              </div>
              <div class="detail-list__row">
                <dt>Transaction Value</dt>
                <dd class="tabular-nums">{{ formatCurrency(alert.transaction_value) }}</dd>
              </div>
              <div class="detail-list__row">
                <dt>Source</dt>
                <dd>{{ alert.source_entity_type }} #{{ alert.source_record_id }}</dd>
              </div>
              <div class="detail-list__row">
                <dt>Created</dt>
                <dd>{{ formatDate(alert.created_at) }}</dd>
              </div>
            </dl>
          </VCard>

          <VCard v-if="alert.vehicle">
            <h4 style="margin-bottom: var(--space-3)">Vehicle</h4>
            <dl class="detail-list">
              <div class="detail-list__row">
                <dt>VIN</dt>
                <dd class="font-mono">{{ alert.vehicle.vin }}</dd>
              </div>
              <div class="detail-list__row">
                <dt>Vehicle ID</dt>
                <dd>#{{ alert.vehicle.id }}</dd>
              </div>
            </dl>
          </VCard>

          <VCard v-if="alert.dealership">
            <h4 style="margin-bottom: var(--space-3)">Dealership</h4>
            <dl class="detail-list">
              <div class="detail-list__row">
                <dt>Name</dt>
                <dd>{{ alert.dealership.name }}</dd>
              </div>
              <div class="detail-list__row">
                <dt>Dealer ID</dt>
                <dd>#{{ alert.dealership.id }}</dd>
              </div>
            </dl>
          </VCard>

          <VCard v-if="alert.buyer">
            <h4 style="margin-bottom: var(--space-3)">Buyer</h4>
            <dl class="detail-list">
              <div class="detail-list__row">
                <dt>Full Name</dt>
                <dd>{{ alert.buyer.full_name }}</dd>
              </div>
              <div class="detail-list__row">
                <dt>National ID</dt>
                <dd class="font-mono">{{ alert.buyer.national_id }}</dd>
              </div>
            </dl>
          </VCard>
        </div>

        <VCard style="margin-top: var(--space-4)">
          <h4 style="margin-bottom: var(--space-3)">Update Status</h4>
          <div v-if="updateError" class="update-error">{{ updateError }}</div>
          <div class="status-form">
            <VSelect
              v-model="newStatus"
              label="New Status"
              :options="statusOptions"
            />
            <VTextarea
              v-model="reason"
              label="Reason"
              placeholder="Provide a reason for the status change..."
              required
            />
            <VButton
              :disabled="!canUpdate() || updating"
              :loading="updating"
              @click="handleStatusUpdate"
            >
              Update Status
            </VButton>
          </div>
        </VCard>
      </template>
    </div>
  </AppShell>
</template>

<style scoped>
.detail-page {
  max-width: 960px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.detail-header__badges {
  display: flex;
  gap: var(--space-2);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-list__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.8125rem;
}

.detail-list__row dt {
  color: var(--color-text-secondary);
}

.detail-list__row dd {
  font-weight: 500;
  text-align: right;
}

.status-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 400px;
}

.update-error {
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-3);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}
</style>
