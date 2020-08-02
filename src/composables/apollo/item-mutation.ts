import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { Ref } from '@vue/composition-api'
import { useMutation } from '@vue/apollo-composable'
import { pick, getFieldNames, unfold } from 'src/utils'

export const useItemMutation = <
  T extends Record<string, unknown>,
  TResult extends Record<string, T>,
  TVariables
>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: Ref<TVariables>,
  result: Ref<T | undefined>
) => {
  const fields = getFieldNames(document)
  const mutation = useMutation<TResult>(document, () => ({
    // variables: variables.value,
    update: (cache, { data }) => {
      // TODO cache one single element

      if (data) {
        // const cacheQuery = cache.readQuery<TResult>({
        //   query: list
        // })
        // if (cacheQuery) {
        console.warn('TODO implement again')
        // const key = Object.keys(cacheQuery)[0]
        // const cachedList = cacheQuery[key]
        // if (cachedList) {
        //   cachedList.push(item)
        //   cache.writeQuery({
        //     query: list,
        //     data: { [key]: cachedList.sort(sort) }
        //   })
        // }
        // }
      }
      //   return item
    }
  }))
  mutation?.onDone(res => {
    if (res?.data) {
      const unfolded = unfold<TResult, T>(document, res.data)
      result.value = result.value
        ? { ...result.value, ...unfolded }
        : { ...unfolded }
    }
  })
  const mutate = async () => {
    return await mutation.mutate(pick(variables.value, fields))
  }
  return { ...mutation, mutate, fields }
}
