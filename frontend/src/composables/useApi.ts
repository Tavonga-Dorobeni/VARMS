import { ref, watch, type Ref } from 'vue'
import api from '@/services/api'
import type { PaginatedData, PaginationParams } from '@/types/api'

interface ApiError {
  message: string
  fields: Record<string, string> | null
}

export function useQuery<T>(
  url: string | Ref<string>,
  params?: Ref<Record<string, unknown>> | Record<string, unknown>,
) {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const resolvedUrl = typeof url === 'string' ? url : url.value
      const resolvedParams = params && 'value' in params ? params.value : params
      const response = await api.get(resolvedUrl, { params: resolvedParams })
      data.value = response.data as T
    } catch (err: unknown) {
      const e = err as ApiError
      error.value = { message: e.message || 'Request failed', fields: e.fields || null }
    } finally {
      loading.value = false
    }
  }

  fetch()

  if (typeof url !== 'string') {
    watch(url, fetch)
  }
  if (params && 'value' in params) {
    watch(params, fetch, { deep: true })
  }

  return { data, loading, error, refetch: fetch }
}

export function usePaginatedQuery<T>(
  url: string,
  initialParams?: PaginationParams & Record<string, unknown>,
) {
  const params = ref<PaginationParams & Record<string, unknown>>({
    page: 1,
    limit: 20,
    sort_order: 'desc',
    ...initialParams,
  })

  const data = ref<PaginatedData<T> | null>(null) as Ref<PaginatedData<T> | null>
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(url, { params: params.value })
      data.value = response.data as PaginatedData<T>
    } catch (err: unknown) {
      const e = err as ApiError
      error.value = { message: e.message || 'Request failed', fields: e.fields || null }
    } finally {
      loading.value = false
    }
  }

  watch(params, fetch, { deep: true })
  fetch()

  return { data, loading, error, params, refetch: fetch }
}

export function useMutation<TResponse, TPayload = unknown>(
  url: string,
  method: 'post' | 'patch' | 'delete' = 'post',
) {
  const data = ref<TResponse | null>(null) as Ref<TResponse | null>
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function mutate(payload?: TPayload, urlOverride?: string) {
    loading.value = true
    error.value = null
    try {
      const target = urlOverride ?? url
      const response = method === 'delete'
        ? await api.delete(target)
        : await api[method](target, payload)
      data.value = response.data as TResponse
      return response.data as TResponse
    } catch (err: unknown) {
      const e = err as ApiError
      error.value = { message: e.message || 'Request failed', fields: e.fields || null }
      throw err
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, mutate }
}
