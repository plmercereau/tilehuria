import { Ref, watch, ref, computed } from '@vue/composition-api'
import { FieldDefinition } from 'src/utils'

declare type Refs<Data> = {
  [K in keyof Data]: Data[K] extends Ref<infer V> ? Ref<V> : Ref<Data[K]>
}

export const useFormFragment = <
  T extends Record<string, unknown>,
  U = Record<keyof T, FieldDefinition>,
  TVariables = Record<keyof T, unknown>
>(
  source: Ref<T | undefined>,
  editing: Readonly<Ref<boolean>>,
  definitions: U
) => {
  const fields = Object.keys(definitions).reduce<{
    [key: string]: Ref<unknown>
  }>(
    (previous, current) => (
      (previous[current] = ref(source.value?.[current])), previous
    ),
    {}
  ) as Refs<TVariables>

  const reset = () => {
    const fieldRefs = fields as Record<string, Ref<unknown>>
    Object.keys(definitions).forEach(
      fieldName => (fieldRefs[fieldName].value = source.value?.[fieldName])
    )
  }

  watch(() => editing.value, reset)
  // * When the source changes and the values are not being edited, trigger a form reset
  watch(
    () => source.value,
    () => !editing.value && reset()
  )

  const values = computed(() => {
    const fieldRefs = fields as Record<string, Ref<unknown>>
    const fieldValues = Object.keys(fieldRefs).reduce<Record<string, unknown>>(
      (previous, current) => (
        (previous[current] = fieldRefs[current].value), previous
      ),
      {}
    )
    return { ...source.value, fieldValues } as T
  })

  return { fields, reset, values }
}
