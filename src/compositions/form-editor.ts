import { ref, Ref, watch, computed, onMounted } from '@vue/composition-api'
import { useResult, useMutation, useQuery } from '@vue/apollo-composable'
import { DocumentNode, FieldNode } from 'graphql'
import { PropType } from 'src/utils'
import { FetchResult } from 'apollo-link'
import {
  buildQueryFromSelectionSet,
  getMutationDefinition
} from 'apollo-utilities'

type RootQueryOrMutation<T extends unknown> = { [key: string]: T } //Record<string, T>
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
      reset()
    } catch (error) {
      console.log('Save failed', error)
    }
  }
  const cancel = () => {
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

  return { editing, edit, save: _save, cancel, values, fields }
}

export type SingleItemSubscriptionOptions<
  T extends DataObject,
  V extends keyof T
> = {
  subscription: DocumentNode
  insert: DocumentNode
  update: DocumentNode
  list: DocumentNode
  defaults: T
  properties: V[]
  id: () => string | undefined // TODO pkfields
}

export const useSingleItemSubscription = <
  T extends DataObject,
  U extends { fieldName: V },
  V extends keyof T
>({
  subscription,
  properties,
  insert,
  update,
  list,
  defaults,
  id
}: SingleItemSubscriptionOptions<T, V>) => {
  const query = buildQueryFromSelectionSet(subscription)
  const isNew = computed(() => !id())

  const { result, loading, onError: onLoadError, subscribeToMore } = useQuery<
    RootQueryOrMutation<T>
  >(query, { id: id() }, { enabled: !isNew.value })

  subscribeToMore(() => ({
    document: subscription,
    variables: {
      id: id()
    }
  }))

  const item = useResult<RootQueryOrMutation<T>, T, T>(
    result,
    defaults,
    // * More generic than data => data.areaOfInterest
    data => data[Object.keys(data)[0]] || defaults
  )
  const { editing, save, edit, cancel, fields, values } = useFormEditor<
    T,
    U,
    V
  >(item, properties, {
    save: async () => {
      if (isNew.value) await mutateInsert()
      else await mutateUpdate()
    }
  })

  const updateMutationName = (getMutationDefinition(update).selectionSet
    .selections[0] as FieldNode).name.value
  const {
    mutate: mutateUpdate,
    onError: onUpdateError,
    onDone: onUpdateDone
  } = useMutation<RootQueryOrMutation<T>>(update, () => ({
    variables: { id: id(), ...values.value },
    optimisticResponse: {
      [updateMutationName]: {
        ...item.value,
        ...values.value
      }
    },
    update: (cache, { data }) => {
      const item = data?.[Object.keys(data)[0]]
      if (data && item) {
        const cachedItem = cache.readQuery<RootQueryOrMutation<T>>({
          query,
          variables: { id: id() }
        })
        if (cachedItem) {
          const key = Object.keys(cachedItem)[0]
          cache.writeQuery({
            query,
            data: { [key]: { ...values.value, ...item } }
          })
        }
        // ? update cache list ?
      }
      return item
    }
  }))

  const {
    mutate: mutateInsert,
    onError: onInsertError,
    onDone: onInsertDone
  } = useMutation<RootQueryOrMutation<T>>(insert, () => ({
    variables: values.value,
    update: (cache, { data }) => {
      // TODO cache one single element
      const item = data?.[Object.keys(data)[0]]
      if (item) {
        const cacheQuery = cache.readQuery<RootQueryOrMutation<T[]>>({
          query: list
        })
        if (cacheQuery) {
          const key = Object.keys(cacheQuery)[0]
          const cachedList = cacheQuery[key]
          if (cachedList) {
            cachedList.push(item)
            cache.writeQuery({
              query: list,
              data: {
                [key]: cachedList
                // TODO sort list
                // .sort((a, b) =>
                //   a.name.toLowerCase() > b.name.toLowerCase()
                //     ? 1
                //     : a.name.toLowerCase() === b.name.toLowerCase()
                //     ? 0
                //     : -1
                // )
              }
            })
          }
        }
      }
      return item
    }
  }))

  const onSaveError: (
    fn: (param?: Error | undefined) => void
  ) => {
    off: () => void
  } = fn => ({
    off: () => {
      onInsertError(fn).off()
      onUpdateError(fn).off()
    }
  })

  const onSaved: (
    fn: (
      param?:
        | FetchResult<
            RootQueryOrMutation<T>,
            Record<string, unknown>,
            Record<string, unknown>
          >
        | undefined
    ) => void
  ) => {
    off: () => void
  } = fn => ({
    off: () => {
      onInsertDone(fn).off()
      onUpdateDone(fn).off()
    }
  })

  onMounted(() => {
    if (!id()) edit()
  })

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
    onSaved,
    values
  }
}
