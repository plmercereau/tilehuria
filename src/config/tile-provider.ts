import {
  SelectOneProviderDocument,
  InsertProviderDocument,
  ListAllTileProvidersDocument,
  RemoveOneTileProviderDocument,
  ProviderFragmentFragment
} from 'src/generated'
import { compareByFields } from 'src/utils'

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
