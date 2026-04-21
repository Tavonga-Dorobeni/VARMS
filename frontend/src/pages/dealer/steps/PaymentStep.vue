<script setup lang="ts">
import VInput from '@/components/ui/VInput.vue'
import VSelect from '@/components/ui/VSelect.vue'
import { PaymentType } from '@/types/enums'

defineProps<{
  salePrice: string
  paymentType: string
  proofOfPayment: string
  saleDate: string
  isActingForAnother: boolean
  beneficialOwnerFullName: string
  beneficialOwnerNationalId: string
  beneficialOwnerRelationshipType: string
  errors?: Record<string, string>
}>()

defineEmits<{
  'update:salePrice': [value: string]
  'update:paymentType': [value: string]
  'update:proofOfPayment': [value: string]
  'update:saleDate': [value: string]
  'update:isActingForAnother': [value: boolean]
  'update:beneficialOwnerFullName': [value: string]
  'update:beneficialOwnerNationalId': [value: string]
  'update:beneficialOwnerRelationshipType': [value: string]
}>()

const paymentOptions = [
  { value: PaymentType.CASH, label: 'Cash' },
  { value: PaymentType.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PaymentType.FINANCE, label: 'Finance' },
]
</script>

<template>
  <div>
    <h3 style="margin-bottom: var(--space-4)">Payment Details</h3>
    <div class="payment-form">
      <VSelect
        :model-value="paymentType"
        label="Payment Type"
        :options="paymentOptions"
        placeholder="Select payment type"
        required
        :error="errors?.payment_type"
        @update:model-value="$emit('update:paymentType', $event)"
      />

      <VInput
        :model-value="salePrice"
        label="Sale Price (US$)"
        type="number"
        placeholder="0.00"
        required
        :error="errors?.sale_price"
        @update:model-value="$emit('update:salePrice', $event)"
      />

      <VInput
        :model-value="proofOfPayment"
        label="Proof of Payment"
        placeholder="Reference number or description"
        required
        :error="errors?.proof_of_payment"
        @update:model-value="$emit('update:proofOfPayment', $event)"
      />

      <VInput
        :model-value="saleDate"
        label="Sale Date"
        type="date"
        required
        :error="errors?.sale_date"
        @update:model-value="$emit('update:saleDate', $event)"
      />

      <div class="payment-form__checkbox">
        <label>
          <input
            type="checkbox"
            :checked="isActingForAnother"
            @change="$emit('update:isActingForAnother', ($event.target as HTMLInputElement).checked)"
          />
          Buying on behalf of someone else?
        </label>
      </div>

      <template v-if="isActingForAnother">
        <div class="payment-form__bo-section">
          <h4>Beneficial Owner Details</h4>
          <VInput
            :model-value="beneficialOwnerFullName"
            label="Full Name"
            required
            :error="errors?.beneficial_owner_full_name"
            @update:model-value="$emit('update:beneficialOwnerFullName', $event)"
          />
          <VInput
            :model-value="beneficialOwnerNationalId"
            label="National ID"
            required
            :error="errors?.beneficial_owner_national_id"
            @update:model-value="$emit('update:beneficialOwnerNationalId', $event)"
          />
          <VInput
            :model-value="beneficialOwnerRelationshipType"
            label="Relationship Type"
            placeholder="e.g. Family member, Business partner"
            required
            :error="errors?.beneficial_owner_relationship_type"
            @update:model-value="$emit('update:beneficialOwnerRelationshipType', $event)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 480px;
}

.payment-form__checkbox {
  display: flex;
  align-items: center;
}

.payment-form__checkbox label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  cursor: pointer;
}

.payment-form__checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.payment-form__bo-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.payment-form__bo-section h4 {
  margin-bottom: var(--space-1);
}
</style>
