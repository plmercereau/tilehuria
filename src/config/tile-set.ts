import { ItemOptions } from 'src/composables'
import { TileSet, UpdateOneTileSet, InsertOneTileSet } from 'src/generated'

export const NESTED_TILE_SET_CONFIG: ItemOptions<
  TileSet,
  'format' | 'quality' | 'areaOfInterestId'
> = {
  insert: InsertOneTileSet,
  update: UpdateOneTileSet,

  properties: ['format', 'quality']
}
