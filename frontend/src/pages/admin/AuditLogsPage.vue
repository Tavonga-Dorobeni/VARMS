<script setup lang="ts">
import AppShell from '@/layouts/AppShell.vue'
import AuditLogTable from '@/components/audit/AuditLogTable.vue'
</script>

<template>
  <AppShell>
    <h2 style="margin-bottom: var(--space-4)">Audit Logs</h2>
    <AuditLogTable />
  </AppShell>
</template>
