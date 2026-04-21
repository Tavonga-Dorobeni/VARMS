import { ref, watch, computed } from 'vue'

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/
const INVALID_CHARS = /[IOQ]/gi

export function useVinValidation() {
  const rawInput = ref('')
  const formattedVin = ref('')

  const isValid = computed(() => VIN_REGEX.test(formattedVin.value))
  const errorMessage = computed(() => {
    const v = formattedVin.value
    if (v.length === 0) return ''
    if (v.length < 17) return `${v.length}/17 characters`
    if (!VIN_REGEX.test(v)) return 'Invalid VIN format'
    return ''
  })

  watch(rawInput, (value) => {
    const cleaned = value.toUpperCase().replace(INVALID_CHARS, '')
    formattedVin.value = cleaned.slice(0, 17)
  })

  function setInput(value: string) {
    rawInput.value = value
  }

  return {
    rawInput,
    formattedVin,
    isValid,
    errorMessage,
    setInput,
  }
}
