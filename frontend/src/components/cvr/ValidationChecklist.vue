<script setup lang="ts">
import type { RegistrationCheck } from '@/services/registration.service'

defineProps<{
  checks: RegistrationCheck[]
}>()

const checkLabels: Record<string, string> = {
  import_log: 'ZIMRA Import Log',
  dealer_trail: 'Dealer Trail',
  sale_record: 'Valid Sale Record',
  buyer_match: 'Buyer Match',
  NOMINEE_BUYER_HOLD: 'FIU Hold',
}

function rowVariant(check: { key: string; passed: boolean }): 'pass' | 'fail' | 'hold' {
  if (check.passed) return 'pass'
  if (check.key === 'NOMINEE_BUYER_HOLD') return 'hold'
  return 'fail'
}
</script>

<template>
  <ul class="checklist">
    <li
      v-for="check in checks"
      :key="check.key"
      :class="['checklist__item', `checklist__item--${rowVariant(check)}`]"
    >
      <span
        class="checklist__icon"
        :aria-label="rowVariant(check) === 'hold' ? 'On hold pending FIU review' : rowVariant(check) === 'pass' ? 'Passed' : 'Failed'"
      >{{ rowVariant(check) === 'hold' ? '⏸' : check.passed ? '✓' : '✗' }}</span>
      <div class="checklist__content">
        <span class="checklist__label">{{ checkLabels[check.key] ?? check.key }}</span>
        <span class="checklist__reason">{{ check.reason }}</span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.checklist__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.checklist__item--pass {
  background: var(--color-success-bg);
}

.checklist__item--fail {
  background: var(--color-danger-bg);
}

.checklist__item--hold {
  background: var(--color-warning-bg);
}

.checklist__item--hold .checklist__icon {
  background: var(--color-warning);
  color: #fff;
}

.checklist__item--hold .checklist__label {
  color: var(--color-warning);
}

.checklist__icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.checklist__item--pass .checklist__icon {
  background: var(--color-success);
  color: #fff;
}

.checklist__item--fail .checklist__icon {
  background: var(--color-danger);
  color: #fff;
}

.checklist__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checklist__label {
  font-weight: 600;
}

.checklist__item--pass .checklist__label {
  color: var(--color-success);
}

.checklist__item--fail .checklist__label {
  color: var(--color-danger);
}

.checklist__reason {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}
</style>
