<script setup lang="ts">
import { useRouter } from 'vue-router'
import VButton from '@/components/ui/VButton.vue'

const router = useRouter()
</script>

<template>
  <div class="error-page">
    <h1>403</h1>
    <p>Access Denied</p>
    <p class="error-page__sub">You do not have permission to access this page.</p>
    <VButton variant="secondary" @click="router.push('/login')">
      Return to Login
    </VButton>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--space-2);
  color: var(--color-text-secondary);
}

.error-page h1 {
  font-size: 4rem;
  color: var(--color-danger);
}

.error-page p {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text);
}

.error-page__sub {
  font-size: 0.875rem !important;
  font-weight: 400 !important;
  color: var(--color-text-secondary) !important;
  margin-bottom: var(--space-4);
}
</style>
