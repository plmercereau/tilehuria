import { ItemOptions } from 'src/utils'
import {
  TileSet,
  InsertOneTileSetDocument,
  UpdateOneTileSetDocument
} from 'src/generated'

export const tile_set: ItemOptions<
  TileSet,
  'format' | 'quality' | 'areaOfInterestId'
> = {
  insert: InsertOneTileSetDocument,
  update: UpdateOneTileSetDocument,

  properties: ['format', 'quality']
}
