<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VCard from '@/components/ui/VCard.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { listInventory } from '@/services/vehicles.service'
import type { Vehicle } from '@/types/models'

const props = defineProps<{
  selectedVehicle: Vehicle | null
}>()

const emit = defineEmits<{
  select: [vehicle: Vehicle]
}>()

const auth = useAuthStore()
const vehicles = ref<Vehicle[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!auth.user?.dealershipId) return
  try {
    const result = await listInventory(auth.user.dealershipId, { status: 'INVENTORY', limit: 100 })
    vehicles.value = result.items
  } catch {
    vehicles.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h3 style="margin-bottom: var(--space-4)">Select Vehicle</h3>
    <p v-if="loading" style="color: var(--color-text-secondary)">Loading inventory...</p>
    <p v-else-if="vehicles.length === 0" style="color: var(--color-text-secondary)">No vehicles available for sale.</p>
    <div v-else class="vehicle-list">
      <VCard
        v-for="v in vehicles"
        :key="v.id"
        :class="['vehicle-card', { 'vehicle-card--selected': props.selectedVehicle?.id === v.id }]"
        @click="emit('select', v)"
      >
        <div class="vehicle-card__header">
          <span class="font-mono">{{ v.vin }}</span>
          <StatusBadge :status="v.status" size="sm" />
        </div>
        <div class="vehicle-card__details">
          {{ v.make }} {{ v.model }} &mdash;
          <span class="tabular-nums">US$ {{ Number(v.declared_value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.vehicle-card {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  padding: var(--space-3) var(--space-4) !important;
}

.vehicle-card:hover {
  border-color: var(--color-primary-hover);
}

.vehicle-card--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.vehicle-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.vehicle-card__details {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}
</style>
