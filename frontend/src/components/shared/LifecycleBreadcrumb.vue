<script setup lang="ts">
import { computed } from 'vue'
import { LifecycleStage } from '@/types/enums'

const props = defineProps<{
  currentStage: LifecycleStage
  timestamps?: {
    borderEntry?: string
    dealerInventory?: string
    pendingSale?: string
    cvrRegistered?: string
  }
}>()

const stages = [
  { key: LifecycleStage.BORDER_ENTRY, label: 'Border Entry', tsKey: 'borderEntry' as const },
  { key: LifecycleStage.DEALER_INVENTORY, label: 'Dealer Inventory', tsKey: 'dealerInventory' as const },
  { key: LifecycleStage.PENDING_SALE, label: 'Pending Sale', tsKey: 'pendingSale' as const },
  { key: LifecycleStage.CVR_REGISTERED, label: 'CVR Registered', tsKey: 'cvrRegistered' as const },
]

const stageOrder = [
  LifecycleStage.BORDER_ENTRY,
  LifecycleStage.DEALER_INVENTORY,
  LifecycleStage.PENDING_SALE,
  LifecycleStage.CVR_REGISTERED,
]

const currentIndex = computed(() => stageOrder.indexOf(props.currentStage))

function getState(index: number): 'completed' | 'current' | 'future' {
  if (index < currentIndex.value) return 'completed'
  if (index === currentIndex.value) return 'current'
  return 'future'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="lifecycle">
    <div
      v-for="(stage, index) in stages"
      :key="stage.key"
      :class="['lifecycle__step', `lifecycle__step--${getState(index)}`]"
    >
      <div class="lifecycle__indicator">
        <span v-if="getState(index) === 'completed'" class="lifecycle__check">&#10003;</span>
        <span v-else class="lifecycle__dot" />
      </div>
      <div class="lifecycle__label">{{ stage.label }}</div>
      <div v-if="timestamps?.[stage.tsKey]" class="lifecycle__date">
        {{ formatDate(timestamps[stage.tsKey]) }}
      </div>
      <div v-if="index < stages.length - 1" :class="['lifecycle__connector', `lifecycle__connector--${getState(index)}`]" />
    </div>
  </div>
</template>

<style scoped>
.lifecycle {
  display: flex;
  align-items: flex-start;
  gap: 0;
  position: relative;
}

.lifecycle__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  text-align: center;
}

.lifecycle__indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 1;
}

.lifecycle__step--completed .lifecycle__indicator {
  background: var(--color-primary);
  color: white;
}

.lifecycle__step--current .lifecycle__indicator {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.15);
}

.lifecycle__step--future .lifecycle__indicator {
  background: var(--color-border);
  color: var(--color-text-muted);
}

.lifecycle__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.lifecycle__check {
  line-height: 1;
}

.lifecycle__label {
  margin-top: var(--space-2);
  font-size: 0.75rem;
  font-weight: 500;
}

.lifecycle__step--completed .lifecycle__label,
.lifecycle__step--current .lifecycle__label {
  color: var(--color-text);
}

.lifecycle__step--future .lifecycle__label {
  color: var(--color-text-muted);
}

.lifecycle__date {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.lifecycle__connector {
  position: absolute;
  top: 14px;
  left: calc(50% + 14px);
  right: calc(-50% + 14px);
  height: 2px;
  z-index: 0;
}

.lifecycle__connector--completed {
  background: var(--color-primary);
}

.lifecycle__connector--current,
.lifecycle__connector--future {
  background: var(--color-border);
}
</style>
