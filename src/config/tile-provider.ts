import { ItemOptions } from 'src/composables'
import {
  TileProvider,
  RemoveOneTileProvider,
  InsertOneTileSet,
  ListAllTileProviders,
  SelectOneProvider
} from 'src/generated'

export const PROVIDER_CONFIG: ItemOptions<TileProvider> = {
  subscription: SelectOneProvider,
  insert: InsertOneTileSet,
  list: ListAllTileProviders,
  remove: RemoveOneTileProvider,

  properties: ['name', 'url', 'slug'],

  sort: (a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase()
      ? 1
      : a.name.toLowerCase() === b.name.toLowerCase()
      ? 0
      : -1
}
