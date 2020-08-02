import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { ref, computed, Ref } from '@vue/composition-api'
import { useFormEditor, useItemSubscription } from 'src/composables'
import { useItemMutation } from './item-mutation'

const copyObject = <T extends Record<string, unknown>, U>(origin: T) =>
  ({ ...origin } as U)

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
  dataToVariables?: (data: T) => VQuery | VInsert | VUpdate | VList | VRemove
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
  type TVariables = VQuery & VInsert & VUpdate & VList & VRemove
  const mergedDefaults = { ...defaults, ...formDefaults } as T
  const item = ref<T>(mergedDefaults) as Ref<T>

  const isNew = computed(
    // TODO not ideal
    () => !(formDefaults && Object.keys(formDefaults).length > 0)
  )

  const formProxy = computed<TVariables>({
    get: () => dataToVariables(item.value) as TVariables,
    set: (val: TVariables) => (variables.value = val)
  })

  const { editing, save, edit, cancel, reset, variables } = useFormEditor<
    TVariables
  >(formProxy, {
    save: async () => {
      if (isNew.value) await insertOp?.mutate()
      else await updateOp?.mutate()
    }
  })

  const subscriptionOp =
    subscription &&
    useItemSubscription(subscription, item, mergedDefaults, variables)
  const insertOp = insert && useItemMutation(insert, variables, item)
  const updateOp = update && useItemMutation(update, variables, item)
  const loading = computed<boolean>(
    () => !!subscriptionOp?.loading.value || !item.value
  )

  return {
    item,
    variables,
    loading,
    editing,
    save,
    edit,
    cancel,
    reset
  }
}
