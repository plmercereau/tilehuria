import { Ref, watch, ref } from '@vue/composition-api'

export const useFormFragment = <T extends Record<string, unknown>>(
  source: Ref<T | undefined>,
  editing: Readonly<Ref<boolean>>
) => {
  const values = ref<T>(source.value || {}) as Ref<T>
  const reset = () => {
    if (source.value) {
      values.value = JSON.parse(JSON.stringify(source.value)) as T
    }
  }

  watch(() => editing.value, reset)

  // * When the source changes and the values are not being edited, trigger a form reset
  watch(
    () => source.value,
    () => !editing.value && reset()
  )

  return { values, reset }
}
