<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getHomeRoute } from '@/router/guards'
import AuthLayout from '@/layouts/AuthLayout.vue'
import VInput from '@/components/ui/VInput.vue'
import VButton from '@/components/ui/VButton.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    await auth.login({ username: username.value, password: password.value })
    const redirect = (route.query.redirect as string) || getHomeRoute(auth.user!.role)
    router.push(redirect)
  } catch (err: unknown) {
    const e = err as { message?: string }
    error.value = e.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="login">
      <h1 class="login__title">VARMS</h1>
      <p class="login__subtitle">Vehicle Asset Registry and Monitoring System</p>

      <form class="login__form" @submit.prevent="handleLogin">
        <div v-if="error" class="login__error">{{ error }}</div>

        <VInput
          v-model="username"
          label="Username"
          placeholder="Enter your username"
          required
        />

        <VInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <VButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="!username || !password"
          style="width: 100%"
        >
          Sign In
        </VButton>
      </form>
    </div>
  </AuthLayout>
</template>

<style scoped>
.login__title {
  text-align: center;
  color: var(--color-primary);
  font-size: 1.75rem;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-1);
}

.login__subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  margin-bottom: var(--space-8);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login__error {
  padding: var(--space-3) var(--space-4);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}
</style>
