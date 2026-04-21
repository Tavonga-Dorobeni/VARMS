<script setup lang="ts">
import VSelect from '@/components/ui/VSelect.vue'
import VInput from '@/components/ui/VInput.vue'
import { UserRole, AuditAction } from '@/types/enums'

defineProps<{
  role: string
  action: string
  entityType: string
  userSearch: string
}>()

defineEmits<{
  'update:role': [value: string]
  'update:action': [value: string]
  'update:entityType': [value: string]
  'update:userSearch': [value: string]
}>()

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.ZIMRA_OFFICER, label: 'ZIMRA Officer' },
  { value: UserRole.DEALER, label: 'Dealer' },
  { value: UserRole.CVR_OFFICER, label: 'CVR Officer' },
  { value: UserRole.FIU_ANALYST, label: 'FIU Analyst' },
]

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: AuditAction.CREATE, label: 'Create' },
  { value: AuditAction.UPDATE, label: 'Update' },
  { value: AuditAction.DELETE, label: 'Delete' },
]

const entityTypeOptions = [
  { value: '', label: 'All Entities' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'dealer', label: 'Dealer' },
  { value: 'sale_transaction', label: 'Sale' },
  { value: 'registration_record', label: 'Registration' },
  { value: 'str_alert', label: 'STR Alert' },
  { value: 'user', label: 'User' },
]
</script>

<template>
  <div class="audit-filters">
    <VSelect
      :model-value="role"
      label="Role"
      :options="roleOptions"
      @update:model-value="$emit('update:role', $event)"
    />
    <VSelect
      :model-value="action"
      label="Action"
      :options="actionOptions"
      @update:model-value="$emit('update:action', $event)"
    />
    <VSelect
      :model-value="entityType"
      label="Entity Type"
      :options="entityTypeOptions"
      @update:model-value="$emit('update:entityType', $event)"
    />
    <VInput
      :model-value="userSearch"
      label="User"
      placeholder="Search by name..."
      @update:model-value="$emit('update:userSearch', $event)"
    />
  </div>
</template>

<style scoped>
.audit-filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: flex-end;
}

.audit-filters > * {
  min-width: 150px;
  flex: 1;
}
</style>
