import {
  SelectOneProviderDocument,
  InsertProviderDocument,
  ListAllTileProvidersDocument,
  RemoveOneTileProviderDocument,
  ProviderFragmentFragment,
  TileProvider
} from 'src/generated'
import { compareByFields } from 'src/utils'
import { HBP_ENDPOINT } from '.'

export const tile_provider = {
  subscription: SelectOneProviderDocument,
  insert: InsertProviderDocument,
  list: ListAllTileProvidersDocument,
  remove: RemoveOneTileProviderDocument,
  defaults: {
    name: '',
    url: '',
    slug: ''
  } as ProviderFragmentFragment,
  sort: compareByFields(['name'])
}

export const tileProviderUrl = (tileProvider?: TileProvider | string) => {
  if (tileProvider) {
    const slug =
      typeof tileProvider === 'string' ? tileProvider : tileProvider.slug
    return `${HBP_ENDPOINT}/storage/o/tile/${slug}/{z}/{x}/{y}.png`
  }
}
