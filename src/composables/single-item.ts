import { computed, onMounted, ref, Ref } from '@vue/composition-api'
import {
  useResult,
  useMutation,
  useQuery,
  MutateWithOptionalVariables
} from '@vue/apollo-composable'
import { FieldNode } from 'graphql'
import { FetchResult } from 'apollo-link'
import {
  buildQueryFromSelectionSet,
  getMutationDefinition
} from 'apollo-utilities'
import { OperationVariables } from 'apollo-client'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'

import { useFormEditor } from './form'

export type RootOperation<T extends unknown> = { [key: string]: T } //Record<string, T>
export type DataObject = { [key: string]: unknown }
export type Id = string // TODO pkfields

type MutateAction<T> = MutateWithOptionalVariables<
  RootOperation<T>,
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
      RootOperation<T>,
      Record<string, unknown>,
      Record<string, unknown>
    >
  ) => void
) => {
  off: () => void
}

export type ItemOptions<T extends DataObject, V extends keyof T = keyof T> = {
  subscription?: TypedDocumentNode
  insert?: TypedDocumentNode
  update?: TypedDocumentNode
  list?: TypedDocumentNode
  remove?: TypedDocumentNode
  properties: V[]
  sort?: (a: T, b: T) => number
}
export type FormOptions<T> = {
  // TODO id as part of defaults, or at least as a ref
  id?: () => Id | undefined // TODO pkfields
  defaults?: Readonly<Ref<Partial<T>>>
  // TODO beforeSave (transform)
}
export const useSingleItem = <
  T extends DataObject,
  V extends keyof T = keyof T
>(
  { subscription, properties, insert, update, list, sort }: ItemOptions<T, V>,
  { id = () => undefined, defaults }: FormOptions<T> | undefined = {
    id: () => undefined
  }
) => {
  const isNew = computed(() => !(id && id()))
  const query = subscription && buildQueryFromSelectionSet(subscription)
  let item = ref<Partial<T>>()
  let loading = ref<boolean>(false)
  let onLoadError: ErrorFunction = () => ({
    off: () => 0
  })
  if (subscription && query) {
    // TODO use TypedDocumentNode?
    // const gqlFetch = <TData, TVariables = Record<string, unknown>>(
    //   operation: TypedDocumentNode<TData, TVariables>,
    //   variables: TVariables,
    //   options:
    //     | UseQueryOptions<TData, TVariables>
    //     | Ref<UseQueryOptions<TData, TVariables>>
    //     | ReactiveFunction<UseQueryOptions<TData, TVariables>>
    // ): UseQueryReturn<TData, TVariables> =>
    //   useQuery<TData, TVariables>(operation, variables, options)

    const {
      result,
      loading: queryLoading,
      onError,
      subscribeToMore
    } = useQuery<RootOperation<T>>(
      query,
      { id: id() },
      { enabled: !isNew.value }
    )

    subscribeToMore(() => ({
      document: subscription,
      variables: {
        id: id()
      }
    }))
    loading = queryLoading
    onLoadError = onError
    item = useResult<RootOperation<T>, Partial<T>, Partial<T>>(
      result,
      defaults?.value,
      // * More generic than data => data.areaOfInterest
      data => data[Object.keys(data)[0]] || defaults?.value
    )
  } else if (defaults) {
    item = defaults
  }

  const onSaveErrors: ErrorFunction[] = []
  const onDones: DoneFunction<T>[] = []
  const { editing, save, edit, cancel, fields, values, reset } = useFormEditor<
    T,
    typeof properties[number]
  >(item as Ref<T>, properties, {
    save: async () => {
      if (isNew.value) await mutateInsert?.()
      else await mutateUpdate?.()
    }
  })

  let mutateUpdate: MutateAction<T> | undefined
  if (update) {
    const updateMutationName = (getMutationDefinition(update).selectionSet
      .selections[0] as FieldNode).name.value
    const { mutate, onError, onDone } = useMutation<RootOperation<T>>(
      update,
      () => ({
        variables: { id: id(), ...values.value },
        optimisticResponse: {
          [updateMutationName]: {
            ...item?.value,
            ...values.value
          } as T
        },
        update: (cache, { data }) => {
          const item = data?.[Object.keys(data)[0]]
          if (data && query && item) {
            const cachedItem = cache.readQuery<RootOperation<T>>({
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
    const { mutate, onError, onDone } = useMutation<RootOperation<T>>(
      insert,
      () => ({
        variables: values.value,
        update: (cache, { data }) => {
          // TODO cache one single element
          const item = data?.[Object.keys(data)[0]]
          if (item && list) {
            const cacheQuery = cache.readQuery<RootOperation<T[]>>({
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
