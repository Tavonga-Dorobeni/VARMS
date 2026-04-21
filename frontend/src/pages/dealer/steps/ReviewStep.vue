<script setup lang="ts">
import VCard from '@/components/ui/VCard.vue'
import type { SalesWizardData } from '@/composables/useSalesWizard'

defineProps<{
  formData: SalesWizardData
}>()

function formatCurrency(value: string | number): string {
  const num = Number(value)
  if (isNaN(num)) return '—'
  return `US$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const paymentLabels: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  FINANCE: 'Finance',
}
</script>

<template>
  <div>
    <h3 style="margin-bottom: var(--space-4)">Review Sale</h3>
    <div class="review-grid">
      <VCard>
        <h4 style="margin-bottom: var(--space-3)">Vehicle</h4>
        <dl class="review-list">
          <div class="review-list__row">
            <dt>VIN</dt>
            <dd class="font-mono">{{ formData.vehicle?.vin }}</dd>
          </div>
          <div class="review-list__row">
            <dt>Make / Model</dt>
            <dd>{{ formData.vehicle?.make }} {{ formData.vehicle?.model }}</dd>
          </div>
        </dl>
      </VCard>

      <VCard>
        <h4 style="margin-bottom: var(--space-3)">Buyer</h4>
        <dl class="review-list">
          <div class="review-list__row">
            <dt>Full Name</dt><dd>{{ formData.buyer_full_name }}</dd>
          </div>
          <div class="review-list__row">
            <dt>National ID</dt><dd>{{ formData.buyer_national_id }}</dd>
          </div>
          <div class="review-list__row">
            <dt>Contact</dt><dd>{{ formData.buyer_contact_details }}</dd>
          </div>
        </dl>
      </VCard>

      <VCard>
        <h4 style="margin-bottom: var(--space-3)">Payment</h4>
        <dl class="review-list">
          <div class="review-list__row">
            <dt>Type</dt><dd>{{ paymentLabels[formData.payment_type] ?? formData.payment_type }}</dd>
          </div>
          <div class="review-list__row">
            <dt>Price</dt><dd class="tabular-nums">{{ formatCurrency(formData.sale_price) }}</dd>
          </div>
          <div class="review-list__row">
            <dt>Proof</dt><dd>{{ formData.proof_of_payment }}</dd>
          </div>
          <div class="review-list__row">
            <dt>Date</dt><dd>{{ formData.sale_date }}</dd>
          </div>
        </dl>
      </VCard>

      <VCard v-if="formData.is_acting_for_another">
        <h4 style="margin-bottom: var(--space-3)">Beneficial Owner</h4>
        <dl class="review-list">
          <div class="review-list__row">
            <dt>Full Name</dt><dd>{{ formData.beneficial_owner_full_name }}</dd>
          </div>
          <div class="review-list__row">
            <dt>National ID</dt><dd>{{ formData.beneficial_owner_national_id }}</dd>
          </div>
          <div class="review-list__row">
            <dt>Relationship</dt><dd>{{ formData.beneficial_owner_relationship_type }}</dd>
          </div>
        </dl>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.review-list {
  display: flex;
  flex-direction: column;
}

.review-list__row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.8125rem;
}

.review-list__row dt {
  color: var(--color-text-secondary);
}

.review-list__row dd {
  font-weight: 500;
  text-align: right;
}
</style>
