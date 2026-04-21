import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { configureApiAuth } from './services/api'

import './assets/styles/reset.css'
import './assets/styles/tokens.css'
import './assets/styles/typography.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
configureApiAuth({
  getToken: () => authStore.getToken(),
  onUnauthorized: () => {
    authStore.logout()
    router.push('/login')
  },
  onForbidden: () => {
    router.push('/access-denied')
  },
})

app.mount('#app')
