<script setup lang="ts">
import TopBar from '@/components/navigation/TopBar.vue'
import SideBar from '@/components/navigation/SideBar.vue'
</script>

<template>
  <div class="app-shell">
    <TopBar />
    <SideBar />
    <main class="app-shell__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell__content {
  margin-top: var(--topbar-height);
  margin-left: var(--sidebar-width);
  padding: var(--space-8);
  min-height: calc(100vh - var(--topbar-height));
}
</style>
