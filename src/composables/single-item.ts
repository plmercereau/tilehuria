import { computed, onMounted } from '@vue/composition-api'
import {
  useResult,
  useMutation,
  useQuery,
  MutateWithOptionalVariables
} from '@vue/apollo-composable'
import { FieldNode, DocumentNode } from 'graphql'
import { FetchResult } from 'apollo-link'
import {
  buildQueryFromSelectionSet,
  getMutationDefinition
} from 'apollo-utilities'
import { OperationVariables } from 'apollo-client'

import { useFormEditor } from './form-editor'

type RootQueryOrMutation<T extends unknown> = { [key: string]: T } //Record<string, T>
type DataObject = { [key: string]: unknown }

type MutateAction<T> = MutateWithOptionalVariables<
  RootQueryOrMutation<T>,
  OperationVariables
>
type ErrorFunction = (
  fn: (param?: Error | undefined) => void
) => {
  off: () => void
}
type DoneFunction<T> = (
  fn: (
    param?: FetchResult<
      RootQueryOrMutation<T>,
      Record<string, unknown>,
      Record<string, unknown>
    >
  ) => void
) => {
  off: () => void
}

export type SingleItemOptions<
  T extends DataObject,
  V extends keyof T = keyof T
> = {
  subscription: DocumentNode
  insert?: DocumentNode
  update?: DocumentNode
  list?: DocumentNode
  defaults?: T // ? Partial<T>
  properties?: V[]
  sort?: (a: T, b: T) => number
}
export const useSingleItem = <
  T extends DataObject,
  U extends { fieldName: V },
  V extends keyof T
>(
  {
    subscription,
    defaults = {} as T,
    properties = Object.keys(defaults) as V[],
    insert,
    update,
    list,
    sort
  }: SingleItemOptions<T, V>,
  id: () => string | undefined = () => undefined // TODO pkfields
) => {
  const query = buildQueryFromSelectionSet(subscription)
  const isNew = computed(() => !(id && id()))

  const { result, loading, onError: onLoadError, subscribeToMore } = useQuery<
    RootQueryOrMutation<T>
  >(query, { id: id() }, { enabled: !isNew.value })

  subscribeToMore(() => ({
    document: subscription,
    variables: {
      id: id()
    }
  }))

  const onSaveErrors: ErrorFunction[] = []
  const onDones: DoneFunction<T>[] = []
  const item = useResult<RootQueryOrMutation<T>, T, T>(
    result,
    defaults,
    // * More generic than data => data.areaOfInterest
    data => data[Object.keys(data)[0]] || defaults
  )
  const { editing, save, edit, cancel, fields, values, reset } = useFormEditor<
    T,
    U,
    V
  >(item, properties, {
    save: async () => {
      if (isNew.value) await mutateInsert?.()
      else await mutateUpdate?.()
    }
  })

  let mutateUpdate: MutateAction<T> | undefined
  if (update) {
    const updateMutationName = (getMutationDefinition(update).selectionSet
      .selections[0] as FieldNode).name.value
    const { mutate, onError, onDone } = useMutation<RootQueryOrMutation<T>>(
      update,
      () => ({
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
      })
    )
    mutateUpdate = mutate
    onSaveErrors.push(onError)
    onDones.push(onDone)
  }

  let mutateInsert: MutateAction<T> | undefined
  if (insert) {
    const { mutate, onError, onDone } = useMutation<RootQueryOrMutation<T>>(
      insert,
      () => ({
        variables: values.value,
        update: (cache, { data }) => {
          // TODO cache one single element
          const item = data?.[Object.keys(data)[0]]
          if (item && list) {
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
                  data: { [key]: cachedList.sort(sort) }
                })
              }
            }
          }
          return item
        }
      })
    )
    mutateInsert = mutate
    onSaveErrors.push(onError)
    onDones.push(onDone)
  }

  const onSaveError: ErrorFunction = fn => {
    const offs = onSaveErrors.map(handler => handler(fn).off)
    return { off: () => offs.map(handler => handler()) }
  }

  const onSaved: DoneFunction<T> = fn => {
    const functions = onDones.map(handler => handler(fn).off)
    return {
      off: () => functions.map(handler => handler())
    }
  }

  onMounted(() => {
    if (!id()) edit()
  })

  return {
    item,
    onLoadError,
    loading,
    editing,
    save,
    reset,
    edit,
    cancel,
    fields,
    onSaveError,
    onSaved,
    values
  }
}
