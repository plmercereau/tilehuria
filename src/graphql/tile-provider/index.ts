import { ItemOptions } from 'src/composables'
import { TileProvider } from 'src/generated'
import subscription from './subscription.graphql'
import insert from './insert.graphql'
import remove from './remove.graphql'
import list from './list.graphql'

export const PROVIDER_CONFIG: ItemOptions<TileProvider> = {
  subscription,
  insert,
  list,
  remove,

  properties: ['name', 'url', 'slug'],

  sort: (a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase()
      ? 1
      : a.name.toLowerCase() === b.name.toLowerCase()
      ? 0
      : -1
}
