import { ItemOptions } from 'src/composables'
import {
  TileSet,
  InsertOneTileSetDocument,
  UpdateOneTileSetDocument
} from 'src/generated'

export const NESTED_TILE_SET_CONFIG: ItemOptions<
  TileSet,
  'format' | 'quality' | 'areaOfInterestId'
> = {
  insert: InsertOneTileSetDocument,
  update: UpdateOneTileSetDocument,

  properties: ['format', 'quality']
}
