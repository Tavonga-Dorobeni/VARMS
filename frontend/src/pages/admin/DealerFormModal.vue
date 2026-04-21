<script setup lang="ts">
import { ref, watch } from 'vue'
import VModal from '@/components/ui/VModal.vue'
import VInput from '@/components/ui/VInput.vue'
import VButton from '@/components/ui/VButton.vue'
import type { Dealer } from '@/types/models'

const props = defineProps<{
  open: boolean
  dealer?: Dealer | null
}>()

const emit = defineEmits<{
  save: [data: {
    name: string
    license_number: string
    address: string
    contact_info: string
    approved_at: string
  }]
  close: []
}>()

const form = ref({
  name: '',
  license_number: '',
  address: '',
  contact_info: '',
  approved_at: new Date().toISOString().split('T')[0],
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)

watch(() => props.open, (isOpen) => {
  if (isOpen && props.dealer) {
    form.value = {
      name: props.dealer.name,
      license_number: props.dealer.license_number,
      address: props.dealer.address,
      contact_info: props.dealer.contact_info,
      approved_at: props.dealer.approved_at?.split('T')[0] ?? '',
    }
  } else if (isOpen) {
    form.value = {
      name: '',
      license_number: '',
      address: '',
      contact_info: '',
      approved_at: new Date().toISOString().split('T')[0],
    }
  }
  errors.value = {}
})

function handleSubmit() {
  emit('save', { ...form.value })
}
</script>

<template>
  <VModal :open="open" :title="dealer ? 'Edit Dealer' : 'Create Dealer'" @close="$emit('close')">
    <form class="dealer-form" @submit.prevent="handleSubmit">
      <VInput v-model="form.name" label="Name" required :error="errors.name" />
      <VInput v-model="form.license_number" label="License Number" required :error="errors.license_number" :disabled="!!dealer" />
      <VInput v-model="form.address" label="Address" required :error="errors.address" />
      <VInput v-model="form.contact_info" label="Contact Info" required :error="errors.contact_info" />
      <VInput v-model="form.approved_at" label="Approved Date" type="date" required :error="errors.approved_at" />

      <div class="dealer-form__actions">
        <VButton variant="ghost" @click="$emit('close')">Cancel</VButton>
        <VButton type="submit" :loading="loading">
          {{ dealer ? 'Update' : 'Create' }}
        </VButton>
      </div>
    </form>
  </VModal>
</template>

<style scoped>
.dealer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dealer-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
