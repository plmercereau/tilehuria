import { useResult, useQuery } from '@vue/apollo-composable'

import {
  ItemOptions,
  useSingleItem,
  RootOperation,
  DataObject
} from './single-item'
import { Ref, ref } from '@vue/composition-api'

export const useItemList = <T extends DataObject, V extends keyof T>(
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
  return { ...singleItem, list, loading }
}
