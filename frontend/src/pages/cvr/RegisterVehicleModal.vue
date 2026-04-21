<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import VModal from '@/components/ui/VModal.vue'
import VInput from '@/components/ui/VInput.vue'
import VButton from '@/components/ui/VButton.vue'
import TrafficLightResult from '@/components/cvr/TrafficLightResult.vue'
import {
  searchRegistration,
  approveRegistration,
  type RegistrationSearchResult,
} from '@/services/registration.service'

const props = defineProps<{ open: boolean; initialVin?: string; initialNationalId?: string }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const vin = ref('')
const nationalId = ref('')
const searching = ref(false)
const searchError = ref('')
const result = ref<RegistrationSearchResult | null>(null)
const approving = ref(false)
const approveError = ref('')
const approved = ref(false)

function reset() {
  vin.value = props.initialVin ?? ''
  nationalId.value = props.initialNationalId ?? ''
  result.value = null
  searchError.value = ''
  approveError.value = ''
  approved.value = false
  searching.value = false
  approving.value = false
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      reset()
      if (vin.value && nationalId.value) handleSearch()
      else nextTick(() => {
        const el = document.querySelector('.register-modal input') as HTMLElement | null
        el?.focus()
      })
    }
  },
)

async function handleSearch() {
  if (!vin.value.trim() || !nationalId.value.trim()) return
  if (searching.value) return

  searching.value = true
  searchError.value = ''
  approveError.value = ''
  result.value = null
  approved.value = false

  try {
    result.value = await searchRegistration({
      vin: vin.value.trim().toUpperCase(),
      national_id: nationalId.value.trim(),
    })
  } catch (err: unknown) {
    const e = err as { message?: string; response?: { data?: { error?: string } } }
    searchError.value = e.response?.data?.error || e.message || 'Search failed.'
  } finally {
    searching.value = false
  }
}

async function handleApprove() {
  if (!result.value || approving.value) return

  approving.value = true
  approveError.value = ''

  try {
    await approveRegistration({
      vehicle_id: result.value.vehicle.id,
      national_id: nationalId.value.trim(),
      registration_date: new Date().toISOString().split('T')[0],
    })
    approved.value = true
    emit('saved')
  } catch (err: unknown) {
    const e = err as { message?: string; response?: { data?: { error?: string } } }
    approveError.value = e.response?.data?.error || e.message || 'Approval failed.'
  } finally {
    approving.value = false
  }
}
</script>

<template>
  <VModal :open="open" title="Register Vehicle" @close="emit('close')">
    <div class="register-modal">
      <div v-if="approved" class="success-panel">
        <div class="success-panel__icon">✓</div>
        <h3>Registration Approved</h3>
        <p>
          Vehicle <span class="font-mono">{{ result?.vehicle.vin }}</span> has been successfully registered.
        </p>
        <div class="success-panel__actions">
          <VButton variant="ghost" @click="reset">Register Another</VButton>
          <VButton @click="emit('close')">Done</VButton>
        </div>
      </div>

      <template v-else>
        <div class="search-form">
          <VInput
            v-model="vin"
            label="VIN"
            placeholder="Enter 17-character VIN"
            required
            @keydown.enter="handleSearch"
          />
          <VInput
            v-model="nationalId"
            label="Requester National ID"
            placeholder="Enter national ID"
            required
            @keydown.enter="handleSearch"
          />
          <div class="search-form__actions">
            <VButton variant="ghost" @click="emit('close')">Cancel</VButton>
            <VButton
              :disabled="!vin.trim() || !nationalId.trim() || searching"
              :loading="searching"
              @click="handleSearch"
            >
              Search
            </VButton>
          </div>
        </div>

        <div v-if="searchError" class="error-msg">{{ searchError }}</div>
        <div v-if="approveError" class="error-msg">{{ approveError }}</div>

        <TrafficLightResult
          v-if="result"
          :result="result"
          :approving="approving"
          @approve="handleApprove"
        />
      </template>
    </div>
  </VModal>
</template>

<style scoped>
.register-modal {
  min-width: 480px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.error-msg {
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.success-panel {
  text-align: center;
  padding: var(--space-4) 0;
}

.success-panel__icon {
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

.success-panel p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.success-panel__actions {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.font-mono {
  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
}
</style>
