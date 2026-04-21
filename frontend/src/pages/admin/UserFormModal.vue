<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import VModal from '@/components/ui/VModal.vue'
import VInput from '@/components/ui/VInput.vue'
import VSelect from '@/components/ui/VSelect.vue'
import VButton from '@/components/ui/VButton.vue'
import { UserRole } from '@/types/enums'
import type { User, Dealer } from '@/types/models'
import { listDealers } from '@/services/dealers.service'
import { DealerStatus } from '@/types/enums'

const props = defineProps<{
  open: boolean
  user?: User | null
}>()

const emit = defineEmits<{
  save: [data: Record<string, unknown>]
  close: []
}>()

const form = ref({
  full_name: '',
  role: '' as UserRole | '',
  agency: '',
  username: '',
  password: '',
  dealership_id: '' as string,
})

const dealers = ref<Dealer[]>([])
const errors = ref<Record<string, string>>({})

const isDealer = computed(() => form.value.role === UserRole.DEALER)

const roleOptions = [
  { value: UserRole.ADMIN, label: 'Administrator' },
  { value: UserRole.ZIMRA_OFFICER, label: 'ZIMRA Officer' },
  { value: UserRole.DEALER, label: 'Dealer' },
  { value: UserRole.CVR_OFFICER, label: 'CVR Officer' },
  { value: UserRole.FIU_ANALYST, label: 'FIU Analyst' },
]

const dealerOptions = computed(() =>
  dealers.value.map(d => ({ value: d.id, label: d.name }))
)

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    if (props.user) {
      form.value = {
        full_name: props.user.full_name,
        role: props.user.role,
        agency: props.user.agency,
        username: props.user.username,
        password: '',
        dealership_id: props.user.dealership_id?.toString() ?? '',
      }
    } else {
      form.value = { full_name: '', role: '', agency: '', username: '', password: '', dealership_id: '' }
    }
    errors.value = {}
    try {
      const result = await listDealers({ status: DealerStatus.ACTIVE, limit: 100 })
      dealers.value = result.items
    } catch {
      dealers.value = []
    }
  }
})

function handleSubmit() {
  const payload: Record<string, unknown> = {
    full_name: form.value.full_name,
    role: form.value.role,
    agency: form.value.agency,
    username: form.value.username,
  }
  if (form.value.password) payload.password = form.value.password
  if (isDealer.value && form.value.dealership_id) {
    payload.dealership_id = Number(form.value.dealership_id)
  }
  emit('save', payload)
}
</script>

<template>
  <VModal :open="open" :title="user ? 'Edit User' : 'Create User'" @close="$emit('close')">
    <form class="user-form" @submit.prevent="handleSubmit">
      <VInput v-model="form.full_name" label="Full Name" required :error="errors.full_name" />
      <VInput v-model="form.username" label="Username" required :error="errors.username" :disabled="!!user" />
      <VInput v-model="form.password" label="Password" type="password" :required="!user" :error="errors.password" :placeholder="user ? 'Leave blank to keep current' : ''" />
      <VSelect v-model="form.role" label="Role" :options="roleOptions" required placeholder="Select a role" :error="errors.role" />
      <VInput v-model="form.agency" label="Agency" required :error="errors.agency" />
      <VSelect
        v-if="isDealer"
        v-model="form.dealership_id"
        label="Dealership"
        :options="dealerOptions"
        required
        placeholder="Select a dealership"
        :error="errors.dealership_id"
      />

      <div class="user-form__actions">
        <VButton variant="ghost" @click="$emit('close')">Cancel</VButton>
        <VButton type="submit">{{ user ? 'Update' : 'Create' }}</VButton>
      </div>
    </form>
  </VModal>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.user-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
