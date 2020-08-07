import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { Ref, ref } from '@vue/composition-api'
import { ObjectToVariablesFunction } from './single-item'
import { useItemMutation } from './item-mutation'
import { useQuery, useResult } from '@vue/apollo-composable'
import { unfold } from 'src/utils'

interface ListOptions<T, RList, RInsert, RRemove, VList, VInsert, VRemove> {
  list: TypedDocumentNode<RList, VList>
  insert?: TypedDocumentNode<RInsert, VInsert>
  remove?: TypedDocumentNode<RRemove, VRemove>
  dataToVariables?: ObjectToVariablesFunction<T, VInsert | VList | VRemove>
  sort?: (a: T, b: T) => number
  defaults: T
}

export const useItemList = <
  T extends Record<string, unknown>,
  RList extends Record<string, T[]>,
  RInsert extends Record<string, T>,
  RRemove extends Record<string, T>,
  VList extends Record<string, unknown>,
  VInsert extends Record<string, unknown>,
  VRemove extends Record<string, unknown>
>({
  list,
  remove,
  // dataToVariables = copyObject,
  sort = () => 0,
  defaults
}: ListOptions<T, RList, RInsert, RRemove, VList, VInsert, VRemove>) =>
  // variables: Ref<VList>
  {
    // TODO subscriptions, queries, subscribe to more...
    // const query = options.list && buildQueryFromSelectionSet(options.list)
    const { result, onError, onResult, loading } = useQuery<RList>(list)
    const resultList = useResult<RList, T[], T[]>(result, [], data => {
      return unfold<RList, T[]>(list, data)
    })

    const item = ref<T>(defaults) as Ref<T>

    const removeItem =
      remove && useItemMutation(remove, 'delete', item, list, sort)

    const removeAction = async (object: T) => {
      item.value = object
      if (removeItem) {
        await removeItem.mutate()
      } else {
        console.warn('Remove mutation is not defined')
      }
    }

    return {
      list: resultList,
      loading,
      remove: removeAction,
      onError,
      onResult
    }
  }
