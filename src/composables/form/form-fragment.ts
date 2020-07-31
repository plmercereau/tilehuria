import { Ref, watch, ref, computed } from '@vue/composition-api'
import { PropType } from 'src/utils'

export const useFormFragment = <T, U extends keyof T = keyof T>(
  source: Ref<T | undefined>,
  editing: Readonly<Ref<boolean>>,
  properties: ReadonlyArray<U> = Object.keys(source) as Array<U>
) => {
  const fields = properties.reduce(
    (previous, current: U) => (
      (previous[current] = ref(source.value?.[current])), previous
    ),
    {} as Required<{ [key in U]: Ref<PropType<T, key> | undefined> }>
  )

  const reset = () => {
    properties.forEach(
      fieldName => (fields[fieldName].value = source.value?.[fieldName])
    )
  }

  watch(() => editing.value, reset)
  // * When the source changes and the values are not being edited, trigger a form reset
  watch(
    () => source.value,
    () => !editing.value && reset()
  )

  const values = computed(() => {
    const newValues = properties.reduce(
      (previous, current: U) => (
        (previous[current] = fields[current].value), previous
      ),
      {} as Required<{ [key in U]: PropType<T, key> | undefined }>
    )
    return { ...source.value, ...newValues }
  })

  return { fields, reset, values }
}
