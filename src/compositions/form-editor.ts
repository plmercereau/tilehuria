import { ref, Ref, watch, computed } from '@vue/composition-api'

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp]

export const useFormEditor = <
  T extends { [key: string]: unknown },
  U extends { fieldName: K },
  K extends keyof T
>(
  source: Readonly<Ref<Readonly<T> | undefined>>,
  fieldNames: K[],
  {
    save
  }: {
    save: (values: Pick<T, U['fieldName']>) => Promise<unknown> | unknown
  }
) => {
  // type dd = fieldNames[number]
  // type uu = U<[12,2]>
  // type vv =

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

  const reset = () =>
    fieldNames.forEach(
      fieldName => (fields[fieldName].value = source.value?.[fieldName])
    )

  const edit = () => {
    reset()
    editing.value = true
  }

  const _save = async () => {
    editing.value = false
    try {
      await Promise.resolve(save(values.value))
      reset()
    } catch (error) {
      console.log('Save failed', error)
    }
  }
  const cancel = () => {
    editing.value = false
    reset()
  }

  // * When the source changes, trigger a form reset
  watch(() => source.value, reset)

  const values = computed(() => {
    return fieldNames.reduce((previous, current) => {
      previous[current] = fields[current].value
      return previous
    }, {} as Partial<T>) as Pick<T, U['fieldName']>
  })

  return { editing, edit, save: _save, cancel, values, fields }
}
