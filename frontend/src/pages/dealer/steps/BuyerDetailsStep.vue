<script setup lang="ts">
import VInput from '@/components/ui/VInput.vue'

defineProps<{
  buyerFullName: string
  buyerNationalId: string
  buyerContactDetails: string
  errors?: Record<string, string>
}>()

defineEmits<{
  'update:buyerFullName': [value: string]
  'update:buyerNationalId': [value: string]
  'update:buyerContactDetails': [value: string]
}>()
</script>

<template>
  <div>
    <h3 style="margin-bottom: var(--space-4)">Buyer Details</h3>
    <div class="buyer-form">
      <VInput
        :model-value="buyerFullName"
        label="Full Name"
        required
        :error="errors?.buyer_full_name"
        @update:model-value="$emit('update:buyerFullName', $event)"
      />
      <VInput
        :model-value="buyerNationalId"
        label="National ID"
        required
        :error="errors?.buyer_national_id"
        @update:model-value="$emit('update:buyerNationalId', $event)"
      />
      <VInput
        :model-value="buyerContactDetails"
        label="Contact Details"
        required
        :error="errors?.buyer_contact_details"
        @update:model-value="$emit('update:buyerContactDetails', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.buyer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 480px;
}
</style>
