import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { Ref, ref } from '@vue/composition-api'
import { useItemSubscription } from './item-subscription'

export const useItemList = <
  T extends Array<Record<string, unknown>>,
  TResult extends Record<string, unknown>,
  TVariables
>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables?: Ref<TVariables>
) => {
  const list = ref<T>([]) as Ref<T>
  const { loading, onResult, onError } = useItemSubscription(
    document,
    list,
    list.value,
    variables
  )
  onError(() => {
    console.log('erreur')
  })
  onResult(() => {
    console.log('result', list.value)
  })
  // const singleItem = useSingleItem(options)
  // let loading: Ref<boolean> = ref(false)
  // let list: Readonly<Ref<TResult>> = ref([])
  // if (options.list) {
  //   const query = useQuery<TResult>(options.list)
  //   loading = query.loading
  //   list = useResult<TResult, TResult, TResult>(
  //     query.result,
  //     {} as TResult, // TODO ugly
  //     data => data // ?
  //   )
  // }
  // let remove: (id: Id) => Promise<void> = () => Promise.resolve()
  // if (options.remove) {
  //   const deleteMutation = useMutation<TResult>(options.remove, () => ({
  //     update: (cache, { data }) => {
  //       const item = data?.[Object.keys(data)[0]]
  //       if (item && options.list) {
  //         const cacheQuery = cache.readQuery<TResult>({
  //           query: options.list
  //         })
  //         if (cacheQuery) {
  //           console.warn('TODO implement again')
  //           const key = Object.keys(cacheQuery)[0]
  //           const cachedList = cacheQuery[key]
  //           if (cachedList) {
  //             // cache.writeQuery({
  //             //   query: options.list,
  //             //   data: {
  //             //     [key]: cachedList
  //             //       .filter(cursor => cursor.id !== item.id)
  //             //       .sort(options.sort)
  //             //   }
  //             // })
  //           }
  //         }
  //       }
  //       return item
  //     }
  //   }))

  //   remove = async (id: Id) => {
  //     await deleteMutation.mutate({ id })
  //   }
  // }
  // return { ...singleItem, list, loading, remove }
  return { list, loading }
}
