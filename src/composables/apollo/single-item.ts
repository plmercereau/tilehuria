import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { ref, computed, Ref } from '@vue/composition-api'
import { useFormEditor, useItemSubscription } from 'src/composables'
import { useItemMutation } from './item-mutation'

export type ObjectToVariablesFunction<T, U> = (object: T, initialObject: T) => U

export const copyObject = <T extends Record<string, unknown>, U>(
  object: T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: T
) => ({ ...object } as U)

interface ItemOptions<
  T,
  RQuery,
  RInsert,
  RUpdate,
  RList,
  RRemove,
  VQuery,
  VInsert,
  VUpdate,
  VList,
  VRemove
> {
  subscription?: TypedDocumentNode<RQuery, VQuery>
  insert?: TypedDocumentNode<RInsert, VInsert>
  update?: TypedDocumentNode<RUpdate, VUpdate>
  list?: TypedDocumentNode<RList, VList>
  remove?: TypedDocumentNode<RRemove, VRemove>
  dataToVariables?: ObjectToVariablesFunction<
    T,
    VQuery | VInsert | VUpdate | VList | VRemove
  >
  sort?: (a: T, b: T) => number
  defaults: T
}

export const useSingleItem = <
  T extends Record<string, unknown>,
  RQuery extends Record<string, T>,
  RInsert extends Record<string, T>,
  RUpdate extends Record<string, T>,
  RList extends Record<string, T[]>,
  RRemove extends Record<string, T>,
  VQuery extends Record<string, unknown>,
  VInsert extends Record<string, unknown>,
  VUpdate extends Record<string, unknown>,
  VList extends Record<string, unknown>,
  VRemove extends Record<string, unknown>
>(
  {
    subscription,
    insert,
    update,
    defaults,
    // sort = () => 0
    dataToVariables = copyObject
  }: ItemOptions<
    T,
    RQuery,
    RInsert,
    RUpdate,
    RList,
    RRemove,
    VQuery,
    VInsert,
    VUpdate,
    VList,
    VRemove
  >,
  formDefaults?: Partial<T>
) => {
  // type TVariables = VQuery & VInsert & VUpdate & VList & VRemove
  const mergedDefaults = { ...defaults, ...formDefaults } as T
  const item = ref<T>(mergedDefaults) as Ref<T>

  const isNew = computed(
    // TODO not ideal - won't likely work e.g. when updating after the id has just been added from an insert
    () => !(formDefaults && Object.keys(formDefaults).length > 0)
  )

  const { editing, save, edit, cancel, reset, values } = useFormEditor<T>(
    item,
    {
      save: async () => {
        if (isNew.value) await insertOp?.mutate()
        else await updateOp?.mutate()
      }
    }
  )

  const subscriptionOp =
    subscription &&
    useItemSubscription(
      subscription,
      item,
      mergedDefaults,
      computed(() => dataToVariables(mergedDefaults, mergedDefaults))
    )
  const insertOp =
    insert && useItemMutation(insert, values, item, dataToVariables)
  const updateOp =
    update && useItemMutation(update, values, item, dataToVariables)
  const loading = computed<boolean>(
    () => !!subscriptionOp?.loading.value || !item.value
  )

  return {
    item,
    values,
    loading,
    editing,
    save,
    edit,
    cancel,
    reset
  }
}
