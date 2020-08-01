import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { InsertAoiDocument, UpdateAoiDocument } from 'src/generated'
import { FieldNode } from 'graphql'
import { ref, computed, onMounted } from '@vue/composition-api'
import {
  buildQueryFromSelectionSet,
  getMutationDefinition
} from 'apollo-utilities'
import {
  useResult,
  useQuery,
  MutateWithOptionalVariables,
  useMutation
} from '@vue/apollo-composable'
import { FetchResult } from 'apollo-link'
import { useFormEditor } from 'src/composables'
import { OperationVariables } from 'apollo-client'
import { getFields, FieldDefinition } from 'src/utils'

interface Ref<T> {
  value: T
}

type MutateAction<T> = MutateWithOptionalVariables<
  RootOperation<T>,
  OperationVariables
>

export type RootOperation<T> = { [key: string]: T }
export type Id = string // TODO pkfields

// ? Move back to compositions?
export type FormOptions<T> = {
  // TODO id as part of defaults, or at least as a ref
  id?: () => Id | undefined // TODO pkfields
  defaults?: Readonly<Ref<Partial<T>>>
  // TODO beforeSave (transform)
}

export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] }

declare type Refs<Data> = {
  [K in keyof Data]: Data[K] extends Ref<infer V> ? Ref<V> : Ref<Data[K]>
}

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

type SingleItemResult<
  TData,
  TInsertVariables = Record<string, any>,
  TUpdateVariables = Record<string, any>
> = {
  data?: TData
  errors?: Error[]
  definitions?: Record<
    keyof (TInsertVariables & TUpdateVariables),
    FieldDefinition
  >
  requiredInsert?: Array<keyof TInsertVariables>
  requiredUpdate?: Array<keyof TUpdateVariables>
  fields?: Refs<TInsertVariables | TUpdateVariables>
  item?: Readonly<Ref<Partial<TData> | undefined>>
  editing: Readonly<Ref<boolean>>
  values: Readonly<Ref<Readonly<TData>>>
  onLoadError: ErrorFunction
  loading: Readonly<Ref<boolean>>
  save: () => Promise<void>
  reset: () => void
  edit: () => void
  cancel: () => void
  onSaveError: ErrorFunction
  onSaved: DoneFunction<TData>
}

export type ItemOptions<
  TData,
  TQueryVariables = Record<string, any>,
  TInsertVariables = Record<string, any>,
  TUpdateVariables = Record<string, any>
> = {
  subscription?: TypedDocumentNode<TData, TQueryVariables>
  insert?: TypedDocumentNode<TData, TInsertVariables>
  update?: TypedDocumentNode<TData, TUpdateVariables>
  list?: TypedDocumentNode<TData>
  remove?: TypedDocumentNode<TData>
  sort?: (a: TData, b: TData) => number
}

export function useSingleItem<
  TData extends Record<string, unknown>,
  TQueryVariables,
  TInsertVariables,
  TUpdateVariables
>(
  {
    subscription,
    insert,
    update,
    list,
    sort
  }: ItemOptions<TData, TQueryVariables, TInsertVariables, TUpdateVariables>,
  { id = () => undefined, defaults }: FormOptions<TData> | undefined = {
    id: () => undefined
  }
): SingleItemResult<TData, TInsertVariables, TUpdateVariables> {
  const isNew = computed(() => !(id && id()))
  const query = subscription && buildQueryFromSelectionSet(subscription)
  let item = ref<Partial<TData> | undefined>()
  let loading = ref<boolean>(false)
  let onLoadError: ErrorFunction = () => ({
    off: () => 0
  })

  if (subscription && query) {
    // TODO use TypedDocumentNode?

    const {
      result,
      loading: queryLoading,
      onError,
      subscribeToMore
    } = useQuery<RootOperation<TData>>(
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
    item = useResult<
      RootOperation<TData>,
      Partial<TData> | undefined,
      Partial<TData> | undefined
    >(
      result,
      defaults?.value,
      // * More generic than data => data.areaOfInterest
      data => data[Object.keys(data)[0]] || defaults?.value
    )
  } else if (defaults) {
    item = defaults
  }

  const onSaveErrors: ErrorFunction[] = []
  const onDones: DoneFunction<TData>[] = []

  // const fields = ['dudule'] as Array<keyof TInsertVariables>
  // const insertFieldNames = getFieldNames(insert)
  // const updateFieldNames = getFieldNames(update)
  // * Merge arrays without duplicates
  const definitions: Record<
    keyof (TInsertVariables & TUpdateVariables),
    FieldDefinition
  > = { ...getFields(insert), ...getFields(update) }

  const { editing, save, edit, cancel, reset, values, fields } = useFormEditor<
    TData,
    Record<keyof (TInsertVariables & TUpdateVariables), FieldDefinition>,
    TInsertVariables & TUpdateVariables
  >(item as Readonly<Ref<Readonly<TData> | undefined>>, definitions, {
    save: async () => {
      if (isNew.value) await mutateInsert?.()
      else await mutateUpdate?.()
    }
  })

  let mutateUpdate: MutateAction<TData> | undefined
  if (update) {
    const updateMutationName = (getMutationDefinition(update).selectionSet
      .selections[0] as FieldNode).name.value
    const { mutate, onError, onDone } = useMutation<RootOperation<TData>>(
      update,
      () => ({
        variables: { id: id(), ...values.value },
        optimisticResponse: {
          [updateMutationName]: {
            ...item?.value,
            ...values.value
          } as TData
        },
        update: (cache, { data }) => {
          const item = data?.[Object.keys(data)[0]]
          if (data && query && item) {
            const cachedItem = cache.readQuery<RootOperation<TData>>({
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

  let mutateInsert: MutateAction<TData> | undefined
  if (insert) {
    const { mutate, onError, onDone } = useMutation<RootOperation<TData>>(
      insert,
      () => ({
        variables: values.value,
        update: (cache, { data }) => {
          // TODO cache one single element
          const item = data?.[Object.keys(data)[0]]
          if (item && list) {
            const cacheQuery = cache.readQuery<RootOperation<TData[]>>({
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

  const onSaved: DoneFunction<TData> = fn => {
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
// const fields = properties.reduce(
//   (previous, current) => ((previous[current] = ref(undefined)), previous),
//   {} as Record<keyof (TInsertVariables & TUpdateVariables), Ref<unknown>>
// ) as Refs<TInsertVariables | TInsertVariables>

const bip = useSingleItem({
  insert: InsertAoiDocument,
  update: UpdateAoiDocument
})
bip.definitions?.maxZoom.multiple
// const bip2 = gqlFetch(UpdateAoiDocument)
bip.definitions?.id.multiple
bip.fields?.minZoom.value
bip.fields?.source.value
bip.requiredInsert?.push('source')
bip.values.value
