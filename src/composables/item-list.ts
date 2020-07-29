import { useResult, useQuery, useMutation } from '@vue/apollo-composable'

import {
  ItemOptions,
  useSingleItem,
  RootOperation,
  DataObject,
  Id
} from './single-item'
import { Ref, ref } from '@vue/composition-api'

export const useItemList = <T extends DataObject, V extends keyof T = keyof T>(
  options: ItemOptions<T, V>
) => {
  const singleItem = useSingleItem(options)
  let loading: Ref<boolean> = ref(false)
  let list: Readonly<Ref<readonly T[]>> = ref([])
  if (options.list) {
    const query = useQuery<RootOperation<T[]>>(options.list)
    loading = query.loading
    list = useResult<RootOperation<T[]>, T[], T[]>(
      query.result,
      [],
      data => data && data[Object.keys(data)[0]]
    )
  }
  let remove: (id: Id) => Promise<void> = () => Promise.resolve()
  if (options.remove) {
    const deleteMutation = useMutation<RootOperation<T>>(
      options.remove,
      () => ({
        update: (cache, { data }) => {
          const item = data?.[Object.keys(data)[0]]
          if (item && options.list) {
            const cacheQuery = cache.readQuery<RootOperation<T[]>>({
              query: options.list
            })
            if (cacheQuery) {
              const key = Object.keys(cacheQuery)[0]
              const cachedList = cacheQuery[key]
              if (cachedList) {
                cache.writeQuery({
                  query: options.list,
                  data: {
                    [key]: cachedList
                      .filter(cursor => cursor.id !== item.id)
                      .sort(options.sort)
                  }
                })
              }
            }
          }
          return item
        }
      })
    )

    remove = async (id: Id) => {
      await deleteMutation.mutate({ id })
    }
  }
  return { ...singleItem, list, loading, remove }
}
