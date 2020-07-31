import { ItemOptions } from 'src/utils'
import {
  TileProvider,
  SelectOneProviderDocument,
  InsertOneTileSetDocument,
  ListAllTileProvidersDocument,
  RemoveOneTileProviderDocument
} from 'src/generated'

export const tile_provider: ItemOptions<TileProvider> = {
  subscription: SelectOneProviderDocument,
  insert: InsertOneTileSetDocument,
  list: ListAllTileProvidersDocument,
  remove: RemoveOneTileProviderDocument,

  properties: ['name', 'url', 'slug'],

  sort: (a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase()
      ? 1
      : a.name.toLowerCase() === b.name.toLowerCase()
      ? 0
      : -1
}
