<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VCard from '@/components/ui/VCard.vue'
import VButton from '@/components/ui/VButton.vue'
import { getSaleById } from '@/services/sales.service'
import type { SaleTransaction } from '@/types/models'

const route = useRoute()
const router = useRouter()
const sale = ref<SaleTransaction | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    sale.value = await getSaleById(id)
  } catch {
    // If we can't load sale details, still show a generic success
  } finally {
    loading.value = false
  }
})

function formatCurrency(value: string | number): string {
  const num = Number(value)
  if (isNaN(num)) return '—'
  return `US$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}
</script>

<template>
  <AppShell>
    <div class="success-page">
      <VCard class="success-card">
        <div class="success-card__icon">✓</div>
        <h2>Sale Recorded Successfully</h2>
        <p v-if="loading" style="color: var(--color-text-secondary)">Loading details...</p>
        <template v-else-if="sale">
          <dl class="success-details">
            <div class="success-details__row">
              <dt>Sale ID</dt>
              <dd class="font-mono">#{{ sale.id }}</dd>
            </div>
            <div class="success-details__row">
              <dt>Buyer</dt>
              <dd>{{ sale.buyer_full_name }}</dd>
            </div>
            <div class="success-details__row">
              <dt>Amount</dt>
              <dd class="tabular-nums">{{ formatCurrency(sale.sale_price) }}</dd>
            </div>
            <div class="success-details__row">
              <dt>Date</dt>
              <dd>{{ sale.sale_date }}</dd>
            </div>
          </dl>
        </template>
        <p v-else style="color: var(--color-text-secondary)">Sale has been recorded.</p>

        <div class="success-card__actions">
          <VButton @click="router.push({ name: 'dealer-sales-new' })">Record Another Sale</VButton>
          <VButton variant="secondary" @click="router.push({ name: 'dealer-inventory' })">Back to Inventory</VButton>
        </div>
      </VCard>
    </div>
  </AppShell>
</template>

<style scoped>
.success-page {
  display: flex;
  justify-content: center;
  padding-top: var(--space-6);
}

.success-card {
  max-width: 480px;
  width: 100%;
  text-align: center;
}

.success-card__icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-4);
  border-radius: 50%;
  background: var(--color-success-bg);
  color: var(--color-success);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-card h2 {
  margin-bottom: var(--space-4);
}

.success-details {
  text-align: left;
  margin-bottom: var(--space-5);
}

.success-details__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.success-details__row dt {
  color: var(--color-text-secondary);
}

.success-details__row dd {
  font-weight: 500;
}

.success-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
