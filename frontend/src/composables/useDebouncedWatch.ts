import { watch, type WatchSource } from 'vue'

/**
 * Watch a reactive source and run the callback after the user stops
 * changing it for `delay` ms. Skips the initial value.
 */
export function useDebouncedWatch<T>(
  source: WatchSource<T>,
  callback: (value: T) => void,
  delay = 300,
): void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let first = true
  watch(source, (value) => {
    if (first) {
      first = false
      return
    }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => callback(value as T), delay)
  })
}
