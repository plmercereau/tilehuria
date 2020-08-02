import {
  SelectOneProviderDocument,
  InsertOneTileSetDocument,
  ListAllTileProvidersDocument,
  RemoveOneTileProviderDocument,
  ProviderFragmentFragment
} from 'src/generated'

export const tile_provider = {
  subscription: SelectOneProviderDocument,
  insert: InsertOneTileSetDocument,
  list: ListAllTileProvidersDocument,
  remove: RemoveOneTileProviderDocument,
  defaults: {
    name: '',
    url: '',
    slug: ''
  } as ProviderFragmentFragment
  // sort: (a, b) =>
  //   a.name.toLowerCase() > b.name.toLowerCase()
  //     ? 1
  //     : a.name.toLowerCase() === b.name.toLowerCase()
  //     ? 0
  //     : -1
}
