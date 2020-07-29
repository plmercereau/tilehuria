import { ref, Ref, watch, computed } from '@vue/composition-api'
import { PropType } from 'src/utils'

type DataObject = { [key: string]: unknown }

export const useFormEditor = <
  T extends DataObject,
  V extends keyof T = keyof T
>(
  source: Readonly<Ref<Readonly<T> | undefined>>,
  fieldNames: V[],
  {
    save
  }: {
    save: (values: Record<V, unknown>) => Promise<unknown> | unknown
  }
) => {
  const editing = ref(false)

  const fields = fieldNames.reduce(
    (previous, current: V) => (
      (previous[current] = ref(source.value?.[current])), previous
    ),
    {} as Required<
      { [key in typeof fieldNames[number]]: Ref<PropType<T, key> | undefined> }
    >
  )

  const reset = () => {
    fieldNames.forEach(fieldName => {
      fields[fieldName].value
      source.value?.[fieldName]
      fields[fieldName].value = source.value?.[fieldName]
    })
  }

  const edit = () => {
    reset()
    editing.value = true
  }

  const _save = async () => {
    editing.value = false
    try {
      await Promise.resolve(save(values.value))
    } catch (error) {
      console.log('Save failed', error)
    }
  }

  const cancel = (): void => {
    editing.value = false
    reset()
  }

  // * When the source changes and the values are not being edited, trigger a form reset
  watch(
    () => source.value,
    () => !editing.value && reset()
  )

  const values = computed(() => {
    return fieldNames.reduce(
      (previous, current) => (
        (previous[current] = fields[current].value), previous
      ),
      {} as Required<{ [key in V]: PropType<T, key> | undefined }>
    )
  })

  return { editing, edit, save: _save, cancel, values, fields, reset }
}
