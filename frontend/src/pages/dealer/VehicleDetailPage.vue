<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VSpinner from '@/components/ui/VSpinner.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import LifecycleBreadcrumb from '@/components/shared/LifecycleBreadcrumb.vue'
import { getVehicleDetail } from '@/services/vehicles.service'
import { LifecycleStage, VehicleStatus } from '@/types/enums'
import type { Vehicle } from '@/types/models'

const route = useRoute()
const vehicle = ref<Vehicle | null>(null)
const loading = ref(true)
const error = ref('')

const currentStage = computed(() => {
  if (!vehicle.value) return LifecycleStage.BORDER_ENTRY
  switch (vehicle.value.status) {
    case VehicleStatus.CLEARED:
    case VehicleStatus.INVENTORY:
      return LifecycleStage.DEALER_INVENTORY
    case VehicleStatus.SOLD:
      return LifecycleStage.PENDING_SALE
    case VehicleStatus.REGISTERED:
      return LifecycleStage.CVR_REGISTERED
    default:
      return LifecycleStage.DEALER_INVENTORY
  }
})

const timestamps = computed(() => {
  if (!vehicle.value) return {}
  const ts: Record<string, string | undefined> = {}
  if (vehicle.value.import_records?.[0]) {
    ts.borderEntry = vehicle.value.import_records[0].timestamp
  }
  ts.dealerInventory = vehicle.value.created_at
  if (vehicle.value.sales?.[0]) {
    ts.pendingSale = vehicle.value.sales[0].sale_date
  }
  if (vehicle.value.registrations?.[0]) {
    ts.cvrRegistered = vehicle.value.registrations[0].registration_date
  }
  return ts
})

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    vehicle.value = await getVehicleDetail(id)
  } catch (err: unknown) {
    error.value = (err as { message?: string }).message || 'Failed to load vehicle'
  } finally {
    loading.value = false
  }
})

function formatCurrency(value: number): string {
  return `US$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <AppShell>
    <div v-if="loading" style="display: flex; justify-content: center; padding: var(--space-12)">
      <VSpinner size="lg" />
    </div>

    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <template v-else-if="vehicle">
      <h2 style="margin-bottom: var(--space-4)">
        Vehicle <span class="font-mono">{{ vehicle.vin }}</span>
      </h2>

      <div style="margin-bottom: var(--space-6)">
        <LifecycleBreadcrumb :current-stage="currentStage" :timestamps="timestamps" />
      </div>

      <div class="detail-grid">
        <VCard>
          <h4 style="margin-bottom: var(--space-4)">Vehicle Details</h4>
          <dl class="detail-list">
            <div class="detail-list__row">
              <dt>VIN</dt>
              <dd class="font-mono">{{ vehicle.vin }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Make</dt><dd>{{ vehicle.make }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Model</dt><dd>{{ vehicle.model }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Declared Value</dt>
              <dd class="tabular-nums">{{ formatCurrency(vehicle.declared_value) }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Country of Origin</dt><dd>{{ vehicle.country_of_origin }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Import Date</dt><dd>{{ formatDate(vehicle.import_date) }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Status</dt><dd><StatusBadge :status="vehicle.status" /></dd>
            </div>
          </dl>
        </VCard>

        <VCard v-if="vehicle.import_records?.[0]">
          <h4 style="margin-bottom: var(--space-4)">Import Record</h4>
          <dl class="detail-list">
            <div class="detail-list__row">
              <dt>Border Post</dt><dd>{{ vehicle.import_records[0].border_post }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Timestamp</dt><dd>{{ formatDate(vehicle.import_records[0].timestamp) }}</dd>
            </div>
          </dl>
        </VCard>

        <VCard v-if="vehicle.sales?.[0]">
          <h4 style="margin-bottom: var(--space-4)">Sale Record</h4>
          <dl class="detail-list">
            <div class="detail-list__row">
              <dt>Buyer</dt><dd>{{ vehicle.sales[0].buyer?.full_name ?? '—' }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Sale Price</dt>
              <dd class="tabular-nums">{{ formatCurrency(vehicle.sales[0].sale_price) }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Payment Type</dt><dd>{{ vehicle.sales[0].payment_type }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Sale Date</dt><dd>{{ formatDate(vehicle.sales[0].sale_date) }}</dd>
            </div>
          </dl>
        </VCard>

        <VCard v-if="vehicle.registrations?.[0]">
          <h4 style="margin-bottom: var(--space-4)">Registration Record</h4>
          <dl class="detail-list">
            <div class="detail-list__row">
              <dt>Registration Date</dt>
              <dd>{{ formatDate(vehicle.registrations[0].registration_date) }}</dd>
            </div>
            <div class="detail-list__row">
              <dt>Status</dt><dd>{{ vehicle.registrations[0].status }}</dd>
            </div>
          </dl>
        </VCard>
      </div>
    </template>
  </AppShell>
</template>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
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
}

.detail-list__row dt {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.detail-list__row dd {
  font-weight: 500;
  text-align: right;
}

.error-banner {
  padding: var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-md);
}
</style>
