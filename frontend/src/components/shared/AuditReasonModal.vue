<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import VModal from '@/components/ui/VModal.vue'
import VTextarea from '@/components/ui/VTextarea.vue'
import VButton from '@/components/ui/VButton.vue'

const props = defineProps<{
  open: boolean
  title?: string
  actionLabel?: string
  destructive?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [reason: string]
  cancel: []
}>()

const reason = ref('')

const canConfirm = computed(() => reason.value.trim().length > 0)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    reason.value = ''
  }
})

function handleConfirm() {
  if (canConfirm.value) {
    emit('confirm', reason.value.trim())
  }
}
</script>

<template>
  <VModal :open="open" :title="title ?? 'Reason Required'" @close="$emit('cancel')">
    <div class="audit-modal">
      <VTextarea
        v-model="reason"
        label="Please provide a reason for this action"
        placeholder="Enter your justification..."
        required
        :rows="4"
      />
      <div class="audit-modal__actions">
        <VButton variant="ghost" @click="$emit('cancel')">Cancel</VButton>
        <VButton
          :variant="destructive ? 'danger' : 'primary'"
          :disabled="!canConfirm"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ actionLabel ?? 'Confirm' }}
        </VButton>
      </div>
    </div>
  </VModal>
</template>

<style scoped>
.audit-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.audit-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
