<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppShell from '@/layouts/AppShell.vue'
import DataTable from '@/components/shared/DataTable.vue'
import type { DataTableColumn } from '@/components/shared/DataTable.vue'
import VButton from '@/components/ui/VButton.vue'
import UserFormModal from './UserFormModal.vue'
import { listUsers, createUser, updateUser } from '@/services/users.service'
import type { User } from '@/types/models'

const columns: DataTableColumn[] = [
  { key: 'full_name', label: 'Full Name', sortable: true },
  { key: 'username', label: 'Username' },
  { key: 'role', label: 'Role' },
  { key: 'agency', label: 'Agency' },
  { key: 'status', label: 'Status', width: '100px' },
]

const rows = ref<User[]>([])
const loading = ref(false)
const total = ref(0)
const filters = reactive({ page: 1, limit: 20 })

const formOpen = ref(false)
const editingUser = ref<User | null>(null)

async function fetchUsers() {
  loading.value = true
  try {
    const result = await listUsers(filters)
    rows.value = result.items
    total.value = result.total
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

fetchUsers()

function openCreate() {
  editingUser.value = null
  formOpen.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingUser.value = row as unknown as User
  formOpen.value = true
}

async function handleSave(data: Record<string, unknown>) {
  try {
    if (editingUser.value) {
      await updateUser(editingUser.value.id, data)
    } else {
      await createUser(data as Parameters<typeof createUser>[0])
    }
    formOpen.value = false
    fetchUsers()
  } catch {
    // Errors handled by API layer
  }
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  ZIMRA_OFFICER: 'ZIMRA Officer',
  DEALER: 'Dealer',
  CVR_OFFICER: 'CVR Officer',
  FIU_ANALYST: 'FIU Analyst',
}
</script>

<template>
  <AppShell>
    <div class="page-header">
      <h2>User Management</h2>
      <VButton @click="openCreate">Create User</VButton>
    </div>

    <DataTable
      :columns="columns"
      :rows="(rows as unknown as Record<string, unknown>[])"
      :loading="loading"
      :total-items="total"
      :page="filters.page"
      :limit="filters.limit"
      @update:page="(p) => { filters.page = p; fetchUsers() }"
      @update:limit="(l) => { filters.limit = l; filters.page = 1; fetchUsers() }"
      @row-click="openEdit"
    >
      <template #cell-role="{ value }">
        {{ roleLabels[value as string] ?? value }}
      </template>
      <template #cell-status="{ value }">
        <span :style="{ color: value === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)' }">
          {{ value }}
        </span>
      </template>
    </DataTable>

    <UserFormModal
      :open="formOpen"
      :user="editingUser"
      @save="handleSave"
      @close="formOpen = false"
    />
  </AppShell>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}
</style>
