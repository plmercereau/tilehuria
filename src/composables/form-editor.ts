import { ref, Ref, watch, computed } from '@vue/composition-api'
import { PropType } from 'src/utils'

type DataObject = { [key: string]: unknown }

export const useFormEditor = <
  T extends DataObject,
  U extends { fieldName: V },
  V extends keyof T
>(
  source: Readonly<Ref<Readonly<T> | undefined>>,
  fieldNames: V[],
  {
    save
  }: {
    save: (values: Pick<T, U['fieldName']>) => Promise<unknown> | unknown
  }
) => {
  const editing = ref(false)

  type Fields = Pick<
    Required<
      {
        [key in keyof T]: Ref<PropType<T, key> | undefined>
      }
    >,
    U['fieldName']
  >
  const fields = fieldNames.reduce((previous, current) => {
    previous[current] = ref()
    return previous
  }, {} as Fields)

  const reset = () => {
    fieldNames.forEach(
      fieldName => (fields[fieldName].value = source.value?.[fieldName])
    )
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
    return fieldNames.reduce((previous, current) => {
      previous[current] = fields[current].value
      return previous
    }, {} as Partial<T>) as Pick<T, U['fieldName']>
  })

  return { editing, edit, save: _save, cancel, values, fields, reset }
}
