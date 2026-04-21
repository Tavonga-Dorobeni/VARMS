<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import VModal from '@/components/ui/VModal.vue'
import VInput from '@/components/ui/VInput.vue'
import VSelect from '@/components/ui/VSelect.vue'
import VButton from '@/components/ui/VButton.vue'
import { useVinValidation } from '@/composables/useVinValidation'
import { createImport } from '@/services/vehicles.service'
import { listDealers } from '@/services/dealers.service'
import { DealerStatus } from '@/types/enums'
import type { Dealer } from '@/types/models'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const { formattedVin, isValid: vinValid, errorMessage: vinError, setInput: setVinInput } = useVinValidation()

const make = ref('')
const model = ref('')
const declaredValue = ref('')
const countryOfOrigin = ref('')
const importDate = ref(new Date().toISOString().split('T')[0])
const dealershipId = ref('')
const borderPost = ref('')

const dealers = ref<Dealer[]>([])
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const generalError = ref('')

onMounted(async () => {
  try {
    const result = await listDealers({ status: DealerStatus.ACTIVE, limit: 100 })
    dealers.value = result.items
  } catch {
    dealers.value = []
  }
})

function resetForm() {
  setVinInput('')
  make.value = ''
  model.value = ''
  declaredValue.value = ''
  countryOfOrigin.value = ''
  importDate.value = new Date().toISOString().split('T')[0]
  dealershipId.value = ''
  borderPost.value = ''
  errors.value = {}
  generalError.value = ''
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm()
    nextTick(() => focusField('vin'))
  }
})

function focusField(name: string) {
  nextTick(() => {
    const el = document.querySelector(`[data-field="${name}"]`) as HTMLElement | null
    const input = el?.querySelector('input, select') as HTMLElement | null
    input?.focus()
  })
}

function handleVinInput(value: string) {
  setVinInput(value)
  if (formattedVin.value.length === 17 && vinValid.value) {
    focusField('make')
  }
}

function checkFormValid(): boolean {
  return (
    vinValid.value &&
    make.value.trim() !== '' &&
    model.value.trim() !== '' &&
    declaredValue.value !== '' &&
    countryOfOrigin.value.trim() !== '' &&
    importDate.value !== '' &&
    dealershipId.value !== '' &&
    borderPost.value.trim() !== ''
  )
}

async function handleSubmit() {
  errors.value = {}
  generalError.value = ''
  loading.value = true
  try {
    await createImport({
      vin: formattedVin.value,
      make: make.value,
      model: model.value,
      declared_value: Number(declaredValue.value),
      country_of_origin: countryOfOrigin.value,
      import_date: importDate.value,
      dealership_id: Number(dealershipId.value),
      border_post: borderPost.value,
    })
    emit('saved')
  } catch (err: unknown) {
    const e = err as { message?: string; fields?: Record<string, string> }
    if (e.fields) errors.value = e.fields
    else generalError.value = e.message || 'Import failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VModal :open="open" title="Import Vehicle" @close="emit('close')">
    <form class="import-form" @submit.prevent="handleSubmit">
      <div v-if="generalError" class="import-form__error">{{ generalError }}</div>

      <div data-field="vin">
        <VInput
          :model-value="formattedVin"
          label="VIN"
          placeholder="Enter 17-character VIN"
          required
          :error="errors.vin || (formattedVin.length > 0 ? vinError : '')"
          @update:model-value="handleVinInput"
          @keydown.enter.prevent="focusField('make')"
        />
        <div v-if="formattedVin.length > 0 && vinValid" class="import-form__valid">&#10003; Valid VIN</div>
      </div>

      <div data-field="make">
        <VInput v-model="make" label="Make" placeholder="e.g. Toyota" required :error="errors.make" @keydown.enter.prevent="focusField('model')" />
      </div>

      <div data-field="model">
        <VInput v-model="model" label="Model" placeholder="e.g. Hilux" required :error="errors.model" @keydown.enter.prevent="focusField('declared_value')" />
      </div>

      <div data-field="declared_value">
        <VInput v-model="declaredValue" label="Declared Value (US$)" type="number" placeholder="0.00" required :error="errors.declared_value" @keydown.enter.prevent="focusField('country_of_origin')" />
      </div>

      <div data-field="country_of_origin">
        <VInput v-model="countryOfOrigin" label="Country of Origin" placeholder="e.g. Japan" required :error="errors.country_of_origin" @keydown.enter.prevent="focusField('import_date')" />
      </div>

      <div data-field="import_date">
        <VInput v-model="importDate" label="Import Date" type="date" required :error="errors.import_date" @keydown.enter.prevent="focusField('dealership')" />
      </div>

      <div data-field="dealership">
        <VSelect
          v-model="dealershipId"
          label="Importing Dealership"
          :options="dealers.map(d => ({ value: d.id, label: d.name }))"
          placeholder="Select a dealership"
          required
          :error="errors.dealership_id"
        />
      </div>

      <div data-field="border_post">
        <VInput v-model="borderPost" label="Border Post" placeholder="e.g. Beitbridge" required :error="errors.border_post" @keydown.enter.prevent="handleSubmit" />
      </div>

      <div class="import-form__actions">
        <VButton type="button" variant="ghost" @click="emit('close')">Cancel</VButton>
        <VButton type="submit" :loading="loading" :disabled="!checkFormValid()">Register Vehicle</VButton>
      </div>
    </form>
  </VModal>
</template>

<style scoped>
.import-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.import-form__error {
  padding: var(--space-3) var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.import-form__valid {
  font-size: 0.75rem;
  color: var(--color-success);
  margin-top: var(--space-1);
}

.import-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
</style>
