import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { Ref, computed } from '@vue/composition-api'
import { useQuery } from '@vue/apollo-composable'
import { unfold, getFieldNames, pick } from 'src/utils'
import { buildQueryFromSelectionSet } from 'apollo-utilities'

export const useItemSubscription = <
  T extends Record<string, unknown> | Array<Record<string, unknown>>,
  TResult extends Record<string, T>,
  TVariables
>(
  document: TypedDocumentNode<TResult, TVariables>,
  result: Ref<T | undefined>,
  defaults: T,
  variables?: Ref<TVariables>
) => {
  const fields = getFieldNames(document)
  const pickedVariables = computed(() => {
    return (variables && pick(variables.value, fields)) || {}
  })
  // ? probably not the best way to define isNew
  const isNew = computed(() => variables && !variables.value)

  const query = document && buildQueryFromSelectionSet(document)
  const operation = useQuery<TResult>(query, pickedVariables.value, () => ({
    enabled: !isNew.value
  }))

  operation.subscribeToMore(() => ({
    document: document,
    variables: pickedVariables.value
  }))
  operation.onResult(res => {
    if (res) {
      result.value = unfold<TResult, T>(document, res.data) || defaults
    }
  })
  return operation
}
