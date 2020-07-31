import { TypedDocumentNode } from '@graphql-typed-document-node/core'

interface Ref<T> {
  value: T
}

export type RootOperation<T extends unknown> = { [key: string]: T } //Record<string, T>
// export type DataObject = Record<string, unknown> //{ [key: string]: unknown }
// export type DataObject = { [key: string]: unknown; from: number }
// export abstract class DataObject implements Record<string, unknown> {
// dd: 'dew'
// }
//{ [key: string]: unknown }
export type Id = string // TODO pkfields

// ? Move back to compositions?
export type FormOptions<T> = {
  // TODO id as part of defaults, or at least as a ref
  id?: () => Id | undefined // TODO pkfields
  defaults?: Readonly<Ref<Partial<T>>>
  // TODO beforeSave (transform)
}

export type ItemOptions<T, V extends keyof T = keyof T> = {
  subscription?: TypedDocumentNode
  insert?: TypedDocumentNode
  update?: TypedDocumentNode
  list?: TypedDocumentNode
  remove?: TypedDocumentNode
  properties: V[]
  sort?: (a: T, b: T) => number
}
