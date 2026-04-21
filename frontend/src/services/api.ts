import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

let getToken: (() => string | null) | null = null
let onUnauthorized: (() => void) | null = null
let onForbidden: (() => void) | null = null

export function configureApiAuth(options: {
  getToken: () => string | null
  onUnauthorized: () => void
  onForbidden: () => void
}) {
  getToken = options.getToken
  onUnauthorized = options.onUnauthorized
  onForbidden = options.onForbidden
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (getToken) {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  if (config.method === 'post') {
    config.headers['Idempotency-Key'] = crypto.randomUUID()
  }

  // Strip empty-string / null / undefined query params so filters don't
  // trigger backend validation errors when left blank.
  if (config.params && typeof config.params === 'object') {
    const cleaned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(config.params as Record<string, unknown>)) {
      if (value === '' || value === null || value === undefined) continue
      cleaned[key] = value
    }
    config.params = cleaned
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) {
        response.data = body.data
      } else {
        return Promise.reject({
          message: body.error || 'Request failed',
          fields: body.fields || null,
          response,
        })
      }
    }
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401 && onUnauthorized) {
      onUnauthorized()
    } else if (status === 403 && onForbidden) {
      onForbidden()
    }

    const body = error.response?.data as Record<string, unknown> | undefined
    if (body && 'fields' in body) {
      return Promise.reject({
        message: body.error || 'Validation failed',
        fields: body.fields || null,
        response: error.response,
      })
    }

    return Promise.reject(error)
  },
)

export default api
