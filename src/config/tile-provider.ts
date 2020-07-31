import { ItemOptions } from 'src/composables'
import {
  TileProvider,
  SelectOneProviderDocument,
  InsertOneTileSetDocument,
  ListAllTileProvidersDocument,
  RemoveOneTileProviderDocument
} from 'src/generated'

export const PROVIDER_CONFIG: ItemOptions<TileProvider> = {
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
