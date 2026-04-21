<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/layouts/AppShell.vue'
import VButton from '@/components/ui/VButton.vue'
import VehicleSelectStep from './steps/VehicleSelectStep.vue'
import BuyerDetailsStep from './steps/BuyerDetailsStep.vue'
import PaymentStep from './steps/PaymentStep.vue'
import ReviewStep from './steps/ReviewStep.vue'
import { useSalesWizard } from '@/composables/useSalesWizard'
import { createSale } from '@/services/sales.service'
import type { CreateSalePayload } from '@/services/sales.service'
import type { PaymentType } from '@/types/enums'
import type { Vehicle } from '@/types/models'

const router = useRouter()
const { currentStep, totalSteps, formData, canAdvance, nextStep, prevStep } = useSalesWizard()

const submitting = ref(false)
const submitError = ref('')
const fieldErrors = ref<Record<string, string>>({})

const stepLabels = ['Vehicle', 'Buyer', 'Payment', 'Review']

const isLastStep = computed(() => currentStep.value === totalSteps)

function handleVehicleSelect(vehicle: Vehicle) {
  formData.value.vehicle = vehicle
  formData.value.sale_price = String(vehicle.declared_value)
}

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  submitError.value = ''
  fieldErrors.value = {}

  try {
    const payload: CreateSalePayload = {
      vehicle_id: formData.value.vehicle!.id,
      buyer_full_name: formData.value.buyer_full_name,
      buyer_national_id: formData.value.buyer_national_id,
      buyer_contact_details: formData.value.buyer_contact_details,
      sale_price: Number(formData.value.sale_price),
      payment_type: formData.value.payment_type as PaymentType,
      proof_of_payment: formData.value.proof_of_payment,
      sale_date: formData.value.sale_date,
      is_acting_for_another: formData.value.is_acting_for_another,
    }

    if (formData.value.is_acting_for_another) {
      payload.beneficial_owner_full_name = formData.value.beneficial_owner_full_name
      payload.beneficial_owner_national_id = formData.value.beneficial_owner_national_id
      payload.beneficial_owner_relationship_type = formData.value.beneficial_owner_relationship_type
    }

    const sale = await createSale(payload)
    router.push({ name: 'dealer-sale-success', params: { id: sale.id } })
  } catch (err: unknown) {
    const error = err as { response?: { data?: { error?: string; fields?: Record<string, string> } } }
    if (error.response?.data?.fields) {
      fieldErrors.value = error.response.data.fields
      const fieldKeys = Object.keys(error.response.data.fields)
      if (fieldKeys.some(k => k.startsWith('buyer_'))) {
        currentStep.value = 2
      } else if (fieldKeys.some(k => ['payment_type', 'sale_price', 'proof_of_payment', 'sale_date', 'beneficial_owner_full_name', 'beneficial_owner_national_id', 'beneficial_owner_relationship_type'].includes(k))) {
        currentStep.value = 3
      }
    }
    submitError.value = error.response?.data?.error || 'Failed to record sale. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppShell>
    <div class="wizard">
      <h2 style="margin-bottom: var(--space-4)">Record Sale</h2>

      <nav class="wizard__steps">
        <div
          v-for="(label, i) in stepLabels"
          :key="i"
          :class="[
            'wizard__step-indicator',
            {
              'wizard__step-indicator--active': currentStep === i + 1,
              'wizard__step-indicator--completed': currentStep > i + 1,
            },
          ]"
        >
          <span class="wizard__step-number">{{ currentStep > i + 1 ? '✓' : i + 1 }}</span>
          <span class="wizard__step-label">{{ label }}</span>
        </div>
      </nav>

      <div v-if="submitError" class="wizard__error">
        {{ submitError }}
      </div>

      <div class="wizard__content">
        <VehicleSelectStep
          v-if="currentStep === 1"
          :selected-vehicle="formData.vehicle"
          @select="handleVehicleSelect"
        />

        <BuyerDetailsStep
          v-else-if="currentStep === 2"
          :buyer-full-name="formData.buyer_full_name"
          :buyer-national-id="formData.buyer_national_id"
          :buyer-contact-details="formData.buyer_contact_details"
          :errors="fieldErrors"
          @update:buyer-full-name="formData.buyer_full_name = $event"
          @update:buyer-national-id="formData.buyer_national_id = $event"
          @update:buyer-contact-details="formData.buyer_contact_details = $event"
        />

        <PaymentStep
          v-else-if="currentStep === 3"
          :sale-price="formData.sale_price"
          :payment-type="formData.payment_type"
          :proof-of-payment="formData.proof_of_payment"
          :sale-date="formData.sale_date"
          :is-acting-for-another="formData.is_acting_for_another"
          :beneficial-owner-full-name="formData.beneficial_owner_full_name"
          :beneficial-owner-national-id="formData.beneficial_owner_national_id"
          :beneficial-owner-relationship-type="formData.beneficial_owner_relationship_type"
          :errors="fieldErrors"
          @update:sale-price="formData.sale_price = $event"
          @update:payment-type="formData.payment_type = $event"
          @update:proof-of-payment="formData.proof_of_payment = $event"
          @update:sale-date="formData.sale_date = $event"
          @update:is-acting-for-another="formData.is_acting_for_another = $event"
          @update:beneficial-owner-full-name="formData.beneficial_owner_full_name = $event"
          @update:beneficial-owner-national-id="formData.beneficial_owner_national_id = $event"
          @update:beneficial-owner-relationship-type="formData.beneficial_owner_relationship_type = $event"
        />

        <ReviewStep
          v-else-if="currentStep === 4"
          :form-data="formData"
        />
      </div>

      <div class="wizard__actions">
        <VButton
          v-if="currentStep > 1"
          variant="secondary"
          @click="prevStep"
        >
          Back
        </VButton>
        <div style="flex: 1" />
        <VButton
          v-if="!isLastStep"
          :disabled="!canAdvance"
          @click="nextStep"
        >
          Next
        </VButton>
        <VButton
          v-else
          :disabled="submitting"
          :loading="submitting"
          @click="handleSubmit"
        >
          Submit Sale
        </VButton>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.wizard {
  max-width: 800px;
}

.wizard__steps {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.wizard__step-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  flex: 1;
}

.wizard__step-indicator--active {
  color: var(--color-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-primary);
  font-weight: 600;
}

.wizard__step-indicator--completed {
  color: var(--color-success);
  background: var(--color-success-bg);
}

.wizard__step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--color-border);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.wizard__step-indicator--active .wizard__step-number {
  background: var(--color-primary);
  color: #fff;
}

.wizard__step-indicator--completed .wizard__step-number {
  background: var(--color-success);
  color: #fff;
}

.wizard__step-label {
  white-space: nowrap;
}

.wizard__error {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.wizard__content {
  margin-bottom: var(--space-6);
}

.wizard__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
</style>
