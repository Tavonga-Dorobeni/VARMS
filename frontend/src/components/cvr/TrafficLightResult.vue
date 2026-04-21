<script setup lang="ts">
import { computed } from 'vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import ValidationChecklist from './ValidationChecklist.vue'
import type { RegistrationSearchResult } from '@/services/registration.service'

const props = defineProps<{
  result: RegistrationSearchResult
  approving?: boolean
}>()

defineEmits<{
  approve: []
}>()

const holdCheck = computed(() =>
  props.result.checks.find(c => c.key === 'NOMINEE_BUYER_HOLD' && !c.passed) ?? null,
)
</script>

<template>
  <VCard :class="[
    'traffic-light',
    holdCheck ? 'traffic-light--amber' : result.eligible ? 'traffic-light--green' : 'traffic-light--red',
  ]">
    <div class="traffic-light__header">
      <div class="traffic-light__signal" aria-hidden="true">
        {{ holdCheck ? '⏸' : result.eligible ? '✓' : '✗' }}
      </div>
      <div>
        <h3>
          {{ holdCheck
            ? 'FIU Hold — Registration Blocked'
            : result.eligible
              ? 'Eligible for Registration'
              : 'Registration Blocked' }}
        </h3>
        <p class="traffic-light__vin">
          VIN: <span class="font-mono">{{ result.vehicle.vin }}</span>
        </p>
      </div>
    </div>

    <div v-if="holdCheck" role="alert" class="traffic-light__hold">
      <p class="traffic-light__hold-meta">
        Alert <span class="font-mono">#{{ holdCheck.alert_id ?? '—' }}</span>
      </p>
      <p class="traffic-light__hold-reason">
        <strong>Reason:</strong> {{ holdCheck.reason }}
      </p>
      <p class="traffic-light__hold-note">
        Registration cannot proceed until the alert is cleared or dismissed by an FIU analyst.
      </p>
    </div>
    <div
      v-else-if="!result.eligible && result.failure_reason"
      class="traffic-light__blocked"
    >
      {{ result.failure_reason }}
    </div>

    <ValidationChecklist :checks="result.checks" />

    <div v-if="result.eligible" class="traffic-light__action">
      <VButton :loading="approving" :disabled="approving" @click="$emit('approve')">
        Approve Registration
      </VButton>
    </div>
  </VCard>
</template>

<style scoped>
.traffic-light {
  margin-top: var(--space-4);
}

.traffic-light--green {
  border-color: var(--color-success);
}

.traffic-light--red {
  border-color: var(--color-danger);
}

.traffic-light--amber {
  border-color: var(--color-warning);
}

.traffic-light--amber .traffic-light__signal {
  background: var(--color-warning);
  color: #fff;
}

.traffic-light--amber .traffic-light__header h3 {
  color: var(--color-warning);
}

.traffic-light__hold {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border-left: 3px solid var(--color-warning);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.traffic-light__hold p {
  margin: 0;
}

.traffic-light__hold p + p {
  margin-top: var(--space-2);
}

.traffic-light__hold-meta {
  font-weight: 600;
}

.traffic-light__hold-note {
  color: var(--color-text-secondary);
}

.font-mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}

.traffic-light__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.traffic-light__signal {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.traffic-light--green .traffic-light__signal {
  background: var(--color-success);
  color: #fff;
}

.traffic-light--red .traffic-light__signal {
  background: var(--color-danger);
  color: #fff;
}

.traffic-light__header h3 {
  margin: 0;
}

.traffic-light--green .traffic-light__header h3 {
  color: var(--color-success);
}

.traffic-light--red .traffic-light__header h3 {
  color: var(--color-danger);
}

.traffic-light__vin {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.traffic-light__blocked {
  padding: var(--space-3);
  margin-bottom: var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
}

.traffic-light__action {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
</style>
