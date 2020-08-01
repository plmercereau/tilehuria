import { TypedDocumentNode } from '@graphql-typed-document-node/core'

import {
  TypeNode,
  VariableDefinitionNode,
  OperationDefinitionNode,
  FieldDefinitionNode
} from 'graphql'

export const SCALARS = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number',
  citext: 'string',
  jsonb: 'json',
  smallint: 'number',
  timestamptz: 'data',
  uuid: 'string'
}

export type FieldDefinition = {
  required: boolean
  multiple: boolean
  type: string
  // definition: FieldDefinitionNode
}

const getType = (type: TypeNode | VariableDefinitionNode): string => {
  if (type.kind === 'NamedType') return type.name.value
  // else if (type.kind === 'ListType') return JSON.stringify(type.type)
  else return getType(type.type)
}

const getFieldDefinition = (
  fieldDefinition: FieldDefinitionNode | VariableDefinitionNode
) => ({
  required: fieldDefinition.type.kind === 'NonNullType',
  multiple: fieldDefinition.type.kind === 'ListType',
  type: getType(fieldDefinition.type)
})

export const getFields = <TData, TVariables>(
  document?: TypedDocumentNode<TData, TVariables>
) => {
  const definitions = document?.definitions.find(
    definition => definition.kind === 'OperationDefinition'
  ) as OperationDefinitionNode
  return definitions.variableDefinitions?.reduce(
    (previous, current) => (
      (previous[current.variable.name.value] = getFieldDefinition(current)),
      previous
    ),
    {} as Record<string, FieldDefinition>
  ) as Record<keyof TVariables, FieldDefinition>
}
