import { Ref, watch, ref } from '@vue/composition-api'

export const useFormFragment = <T extends Record<string, unknown>>(
  source: Ref<T | undefined>,
  editing: Readonly<Ref<boolean>>
) => {
  const variables = ref<T>(source.value || {}) as Ref<T>
  const reset = () => {
    if (source.value) variables.value = { ...source.value }
  }

  watch(() => editing.value, reset)

  // * When the source changes and the values are not being edited, trigger a form reset
  watch(
    () => source.value,
    () => !editing.value && reset()
  )

  return { variables, reset }
}
