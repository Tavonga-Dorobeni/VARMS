import { ref, computed } from 'vue'
import { PaymentType } from '@/types/enums'
import type { Vehicle } from '@/types/models'

export interface SalesWizardData {
  vehicle: Vehicle | null
  buyer_full_name: string
  buyer_national_id: string
  buyer_contact_details: string
  sale_price: string
  payment_type: PaymentType | ''
  proof_of_payment: string
  sale_date: string
  is_acting_for_another: boolean
  beneficial_owner_full_name: string
  beneficial_owner_national_id: string
  beneficial_owner_relationship_type: string
}

export function useSalesWizard() {
  const currentStep = ref(1)
  const totalSteps = 4

  const formData = ref<SalesWizardData>({
    vehicle: null,
    buyer_full_name: '',
    buyer_national_id: '',
    buyer_contact_details: '',
    sale_price: '',
    payment_type: '',
    proof_of_payment: '',
    sale_date: new Date().toISOString().split('T')[0],
    is_acting_for_another: false,
    beneficial_owner_full_name: '',
    beneficial_owner_national_id: '',
    beneficial_owner_relationship_type: '',
  })

  const canAdvance = computed(() => {
    switch (currentStep.value) {
      case 1:
        return formData.value.vehicle !== null
      case 2:
        return (
          formData.value.buyer_full_name.trim() !== '' &&
          formData.value.buyer_national_id.trim() !== '' &&
          formData.value.buyer_contact_details.trim() !== ''
        )
      case 3: {
        const base =
          formData.value.payment_type !== '' &&
          formData.value.sale_price !== '' &&
          Number(formData.value.sale_price) > 0 &&
          formData.value.proof_of_payment.trim() !== '' &&
          formData.value.sale_date !== ''

        if (formData.value.is_acting_for_another) {
          return (
            base &&
            formData.value.beneficial_owner_full_name.trim() !== '' &&
            formData.value.beneficial_owner_national_id.trim() !== '' &&
            formData.value.beneficial_owner_relationship_type.trim() !== ''
          )
        }
        return base
      }
      case 4:
        return true
      default:
        return false
    }
  })

  function nextStep() {
    if (canAdvance.value && currentStep.value < totalSteps) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function reset() {
    currentStep.value = 1
    formData.value = {
      vehicle: null,
      buyer_full_name: '',
      buyer_national_id: '',
      buyer_contact_details: '',
      sale_price: '',
      payment_type: '',
      proof_of_payment: '',
      sale_date: new Date().toISOString().split('T')[0],
      is_acting_for_another: false,
      beneficial_owner_full_name: '',
      beneficial_owner_national_id: '',
      beneficial_owner_relationship_type: '',
    }
  }

  return {
    currentStep,
    totalSteps,
    formData,
    canAdvance,
    nextStep,
    prevStep,
    reset,
  }
}
