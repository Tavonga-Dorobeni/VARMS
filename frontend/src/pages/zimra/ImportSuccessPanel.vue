<script setup lang="ts">
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import type { Vehicle } from '@/types/models'

defineProps<{
  vehicle: Vehicle
  dealerName: string
}>()

defineEmits<{
  importAnother: []
}>()
</script>

<template>
  <VCard>
    <div class="success">
      <div class="success__icon">&#10003;</div>
      <h3>Vehicle Imported Successfully</h3>
      <div class="success__details">
        <div class="success__row">
          <span class="success__label">Vehicle ID</span>
          <span class="success__value tabular-nums">{{ vehicle.id }}</span>
        </div>
        <div class="success__row">
          <span class="success__label">VIN</span>
          <span class="success__value font-mono">{{ vehicle.vin }}</span>
        </div>
        <div class="success__row">
          <span class="success__label">Assigned to</span>
          <span class="success__value">{{ dealerName }}</span>
        </div>
      </div>
      <VButton @click="$emit('importAnother')">Import Another Vehicle</VButton>
    </div>
  </VCard>
</template>

<style scoped>
.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  text-align: center;
}

.success__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-success-bg);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.success__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-width: 300px;
}

.success__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.success__label {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.success__value {
  font-weight: 500;
}
</style>
