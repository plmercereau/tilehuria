import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { Ref } from '@vue/composition-api'
import { useMutation } from '@vue/apollo-composable'
import { pick, getFieldNames, unfold } from 'src/utils'
import { ObjectToVariablesFunction, copyObject } from '.'

export const useItemMutation = <
  T extends Record<string, unknown>,
  TResult extends Record<string, T>,
  TVariables
>(
  document: TypedDocumentNode<TResult, TVariables>,
  item: Ref<T>,
  initialItem: Ref<T>,
  dataToVariables: ObjectToVariablesFunction<T, TVariables> = copyObject
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
      item.value = item.value ? { ...item.value, ...unfolded } : { ...unfolded }
    }
  })
  const mutate = async () => {
    console.log('BEFORE MUTATE')
    console.log(item.value.name, initialItem.value.name)
    console.log(item.value.tileSets, initialItem.value.tileSets)
    const variables = dataToVariables(item.value, initialItem.value)
    return await mutation.mutate(pick(variables, fields))
  }
  return { ...mutation, mutate, fields }
}
