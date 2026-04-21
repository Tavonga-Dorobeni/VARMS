<script setup lang="ts">
import { useRouter } from 'vue-router'
import VButton from '@/components/ui/VButton.vue'

const router = useRouter()
</script>

<template>
  <div class="error-page">
    <h1>404</h1>
    <p>Page Not Found</p>
    <p class="error-page__sub">The page you're looking for doesn't exist.</p>
    <VButton variant="secondary" @click="router.back()">
      Go Back
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
  color: var(--color-text-muted);
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
