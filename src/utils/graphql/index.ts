export * from './config'

// TODO as parameter
import intro from 'src/schema.graphql'
import { ObjectTypeDefinitionNode, TypeNode } from 'graphql'

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

const getDefinition = (name: string) =>
  intro.definitions.find(
    definition =>
      definition.kind === 'ObjectTypeDefinition' &&
      definition.name.value === name
  ) as ObjectTypeDefinitionNode | undefined

type FieldDefinition = {
  required: boolean
  multiple: boolean
  type: string
  // definition: FieldDefinitionNode
}

const getType = (type: TypeNode): string => {
  if (type.kind === 'NamedType') return type.name.value
  // else if (type.kind === 'ListType') return JSON.stringify(type.type)
  else return getType(type.type)
}
const getFields = (name?: string | ObjectTypeDefinitionNode) => {
  if (typeof name === 'string') {
    name = getDefinition(name)
  }
  if (name) {
    return name.fields?.reduce<{ [key: string]: FieldDefinition }>(
      (previous, current) => (
        (previous[current.name.value] = {
          required: current.type.kind === 'NonNullType',
          multiple: current.type.kind === 'ListType',
          type: getType(current.type)
          // definition: current
        }),
        previous
      ),
      {}
    )
  }
}
const set = getFields('area_of_interest')

console.log(set)
const inte = getFields('Int')
console.log(inte)
