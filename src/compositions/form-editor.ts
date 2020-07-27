import { ref, Ref, watch, computed } from '@vue/composition-api'
import { useSubscription, useResult, useMutation } from '@vue/apollo-composable'
import { DocumentNode } from 'graphql'

import { PropertyOf, PropType } from 'src/utils'

export const useFormEditor = <
  S extends Record<string, Record<string, unknown>>,
  T extends PropertyOf<S>,
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

export const useSingleItemSubscription = <
  S extends Record<string, Record<string, unknown>>,
  T extends PropertyOf<S>,
  U extends { fieldName: K },
  K extends keyof T
>({
  query,
  properties,
  update,
  defaults,
  id
}: {
  query: DocumentNode
  update: DocumentNode
  defaults: T
  properties: K[]
  id: () => string | undefined
}) => {
  const { result, loading, onError: onLoadError } = useSubscription<S>(
    query,
    { id: id() },
    { enabled: !!id() }
  )
  const item = useResult<S, T, T>(
    result,
    defaults,
    // * More generic than data => data.areaOfInterest
    data => (data[Object.keys(data)[0] as keyof S] as T) || defaults
  )

  const { editing, save, edit, cancel, fields, values } = useFormEditor<
    S,
    T,
    U,
    K
  >(item, properties, {
    save: async () => {
      await mutate()
    }
  })

  const { mutate, onError: onSaveError, onDone: onSaved } = useMutation<S>(
    update,
    () => ({
      variables: { id: id(), ...values.value }
    })
    // TODO update cache
  )

  return {
    item,
    onLoadError,
    loading,
    editing,
    save,
    edit,
    cancel,
    fields,
    onSaveError,
    onSaved
  }
}
